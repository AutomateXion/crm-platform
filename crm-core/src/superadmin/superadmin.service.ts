import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getDashboard() {
    const tenants = await this.tenantRepo.find();
    const users = await this.userRepo.find();
    const planCounts = tenants.reduce((acc: any, t) => {
      acc[t.subscriptionPlan] = (acc[t.subscriptionPlan] || 0) + 1;
      return acc;
    }, {});
    let totalInvoices = 0;
    try {
      const invCounts = await this.tenantRepo.query(`SELECT COUNT(*) as count FROM sales_invoices`);
      totalInvoices = Number(invCounts[0]?.count || 0);
    } catch {}
    return {
      totalTenants: tenants.length,
      activeTenants: tenants.filter(t => t.isActive).length,
      suspendedTenants: tenants.filter(t => !t.isActive).length,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      planCounts,
      totalInvoices,
      recentTenants: tenants.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,5),
    };
  }

  async getTenants(search?: string, plan?: string, status?: string) {
    let qb = this.tenantRepo.createQueryBuilder('t');
    if (search) qb.andWhere('(t.companyName ILIKE :s OR t.tenantCode ILIKE :s)', { s: `%${search}%` });
    if (plan) qb.andWhere('t.subscriptionPlan = :plan', { plan });
    if (status === 'active') qb.andWhere('t.isActive = true');
    if (status === 'suspended') qb.andWhere('t.isActive = false');
    const tenants = await qb.orderBy('t.createdAt', 'DESC').getMany();
    const userCounts = await this.userRepo.query(`SELECT tenant_id, COUNT(*) as count FROM users GROUP BY tenant_id`);
    const ucMap = userCounts.reduce((acc: any, r: any) => { acc[r.tenant_id] = Number(r.count); return acc; }, {});
    let icMap: any = {};
    try {
      const invCounts = await this.tenantRepo.query(`SELECT tenant_id, COUNT(*) as count FROM sales_invoices GROUP BY tenant_id`);
      icMap = invCounts.reduce((acc: any, r: any) => { acc[r.tenant_id] = Number(r.count); return acc; }, {});
    } catch {}
    return tenants.map(t => ({ ...t, userCount: ucMap[t.tenantId]||0, invoiceCount: icMap[t.tenantId]||0 }));
  }

  async createTenant(dto: any) {
    const tenant = this.tenantRepo.create({
      tenantCode: dto.tenantCode.toUpperCase(),
      companyName: dto.companyName,
      subscriptionPlan: dto.subscriptionPlan || 'STARTER',
      maxUsers: dto.maxUsers || 10,
      isActive: true,
      email: dto.email,
      phone: dto.phone,
      country: dto.country || 'Oman',
      timezone: 'Asia/Muscat',
      currencyCode: 'OMR',
      activeModules: ['core','contacts','leads','sales','activities'],
    } as any);
    const savedTenant = await this.tenantRepo.save(tenant) as any;
    if (dto.adminEmail) {
      const hashedPassword = await bcrypt.hash(dto.adminPassword || 'Admin123!', 10);
      await this.userRepo.save(this.userRepo.create({
        tenantId: savedTenant.tenantId, email: dto.adminEmail,
        passwordHash: hashedPassword, fullName: dto.adminName || 'Administrator', isActive: true,
      } as any));
    }
    return { tenant: savedTenant, message: 'Tenant created successfully' };
  }

  async updateTenant(id: string, dto: any) {
    await this.tenantRepo.update({ tenantId: id }, dto);
    return this.tenantRepo.findOne({ where: { tenantId: id } });
  }

  async suspendTenant(id: string, reason: string) {
    await this.tenantRepo.update({ tenantId: id }, { isActive: false, suspendedAt: new Date(), suspensionReason: reason } as any);
    return { success: true };
  }

  async activateTenant(id: string) {
    await this.tenantRepo.update({ tenantId: id }, { isActive: true, suspendedAt: null, suspensionReason: null } as any);
    return { success: true };
  }

  async getTenantStats(id: string) {
    const userCount = await this.userRepo.count({ where: { tenantId: id } as any });
    let invoiceCount = 0, invoiceTotal = 0;
    try {
      const inv = await this.tenantRepo.query(`SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total FROM sales_invoices WHERE tenant_id=$1`, [id]);
      invoiceCount = Number(inv[0]?.count || 0);
      invoiceTotal = Number(inv[0]?.total || 0);
    } catch {}
    return { invoiceCount, invoiceTotal, userCount };
  }

  async getUsers(tenantId?: string, search?: string) {
    let qb = this.userRepo.createQueryBuilder('u');
    if (tenantId) qb.andWhere('u.tenantId = :tenantId', { tenantId });
    if (search) qb.andWhere('(u.fullName ILIKE :s OR u.email ILIKE :s)', { s: `%${search}%` });
    return qb.orderBy('u.createdAt', 'DESC').limit(100).getMany();
  }

  async toggleUser(id: string) {
    const user = await this.userRepo.findOne({ where: { userId: id } as any });
    if (!user) throw new Error('User not found');
    await this.userRepo.update({ userId: id } as any, { isActive: !user.isActive });
    return { success: true, isActive: !user.isActive };
  }

  async getSystemHealth() {
    const tenantCount = await this.tenantRepo.count();
    const userCount = await this.userRepo.count();
    return {
      status: 'healthy', database: 'connected',
      tenants: tenantCount, users: userCount,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      nodeVersion: process.version,
    };
  }
}
