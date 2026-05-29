// ─── tenants.service.ts ───────────────────────────────────────────────────────
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UserGroup } from '../users/entities/user-group.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(UserGroup) private readonly groupRepo: Repository<UserGroup>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateTenant(tenantId: string, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.getTenant(tenantId);
    Object.assign(tenant, dto);
    return this.tenantRepo.save(tenant);
  }

  async updateActiveModules(tenantId: string, modules: string[]): Promise<Tenant> {
    const tenant = await this.getTenant(tenantId);
    // Core is always required
    if (!modules.includes('core')) modules.unshift('core');
    tenant.activeModules = modules;
    return this.tenantRepo.save(tenant);
  }

  // System admin: provision a new tenant
  async createTenant(dto: CreateTenantDto): Promise<{ tenant: Tenant; adminUser: User }> {
    const existing = await this.tenantRepo.findOne({
      where: { tenantCode: dto.tenantCode.toUpperCase() },
    });
    if (existing) throw new ConflictException('Tenant code already in use');

    const tenant = await this.tenantRepo.save(
      this.tenantRepo.create({
        tenantCode: dto.tenantCode.toUpperCase(),
        companyName: dto.companyName,
        domain: dto.domain,
        subscriptionPlan: dto.subscriptionPlan || 'STARTER',
        timezone: dto.timezone || 'Asia/Muscat',
        currencyCode: dto.currencyCode || 'OMR',
        language: dto.language || 'en',
        maxUsers: dto.maxUsers || 10,
        activeModules: ['core', 'contacts', 'leads', 'sales', 'activities'],
        isActive: true,
      }),
    );

    // Create default admin group
    const adminGroup = await this.groupRepo.save(
      this.groupRepo.create({
        tenantId: tenant.tenantId,
        groupCode: 'TENANT_ADMIN',
        groupName: 'Tenant Administrator',
        groupNameAr: 'مدير النظام',
        isSystemGroup: true,
        description: 'Full access to all tenant features',
      }),
    );

    // Create default admin user
    const adminUser = await this.userRepo.save(
      this.userRepo.create({
        tenantId: tenant.tenantId,
        userGroupId: adminGroup.userGroupId,
        email: dto.adminEmail.toLowerCase(),
        fullName: dto.adminName,
        passwordHash: await bcrypt.hash(dto.adminPassword, 10),
        isActive: true,
        isEmailVerified: true,
      }),
    );

    return { tenant, adminUser };
  }

  async getAllTenants(): Promise<Tenant[]> {
    return this.tenantRepo.find({ order: { companyName: 'ASC' } });
  }

  // ── Email Configuration ──────────────────────────────────────
  async getEmailConfig(tenantId: string) {
    const tenant = await this.getTenant(tenantId);
    const settings = (tenant as any).settings || {};
    const emailConfig = settings.emailConfig || {};
    const { password: _, ...safeConfig } = emailConfig;
    return safeConfig;
  }

  async saveEmailConfig(tenantId: string, dto: any) {
    const tenant = await this.getTenant(tenantId);
    const settings = (tenant as any).settings || {};
    const existing = settings.emailConfig || {};
    const newConfig = { ...existing, ...dto, password: dto.password ? dto.password : existing.password };
    settings.emailConfig = newConfig;
    await this.tenantRepo.update({ tenantId }, { settings } as any);
    const { password: _, ...safeConfig } = newConfig;
    return { success: true, config: safeConfig };
  }

  async testEmailConfig(tenantId: string, to: string) {
    const tenant = await this.getTenant(tenantId);
    const settings = (tenant as any).settings || {};
    const cfg = settings.emailConfig;
    if (!cfg?.host || !cfg?.username || !cfg?.password) {
      throw new Error('Email not configured. Please save configuration first.');
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: cfg.host, port: cfg.port || 587, secure: cfg.secure || false,
      auth: { user: cfg.username, pass: cfg.password },
    });
    await transporter.sendMail({
      from: `"${cfg.fromName || 'CRM System'}" <${cfg.fromEmail || cfg.username}>`,
      to, subject: 'Test Email from CRM System',
      html: `<h2>Test Email</h2><p>Your email configuration is working correctly!</p><p>${cfg.signature || ''}</p>`,
    });
        return { success: true, message: `Test email sent to ${to}` };
  }
  async getAccountingConfig(tenantId: string) {
    const tenant = await this.getTenant(tenantId);
    const settings = (tenant as any).settings || {};
    return settings.accountingConfig || {
      accountsReceivable: '1130', salesRevenue: '4100', salesReturns: '4010',
      vatPayable: '2121', vatReceivable: '1160', accountsPayable: '2110',
      inventory: '1140', grni: '1141', cogs: '5001', purchaseReturns: '5010', cashBank: '1120',
    };
  }

  async saveAccountingConfig(tenantId: string, dto: any) {
    const tenant = await this.getTenant(tenantId);
    const settings = (tenant as any).settings || {};
    settings.accountingConfig = dto;
    await this.tenantRepo.update({ tenantId }, { settings } as any);
    return { success: true, config: dto };
  }
}
