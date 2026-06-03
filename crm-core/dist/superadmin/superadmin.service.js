"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const user_entity_1 = require("../users/entities/user.entity");
const bcrypt = require("bcrypt");
let SuperAdminService = class SuperAdminService {
    constructor(tenantRepo, userRepo) {
        this.tenantRepo = tenantRepo;
        this.userRepo = userRepo;
    }
    async getDashboard() {
        const tenants = await this.tenantRepo.find();
        const users = await this.userRepo.find();
        const planCounts = tenants.reduce((acc, t) => {
            acc[t.subscriptionPlan] = (acc[t.subscriptionPlan] || 0) + 1;
            return acc;
        }, {});
        let totalInvoices = 0;
        try {
            const invCounts = await this.tenantRepo.query(`SELECT COUNT(*) as count FROM sales_invoices`);
            totalInvoices = Number(invCounts[0]?.count || 0);
        }
        catch { }
        return {
            totalTenants: tenants.length,
            activeTenants: tenants.filter(t => t.isActive).length,
            suspendedTenants: tenants.filter(t => !t.isActive).length,
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isActive).length,
            planCounts,
            totalInvoices,
            recentTenants: tenants.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
        };
    }
    async getTenants(search, plan, status) {
        let qb = this.tenantRepo.createQueryBuilder('t');
        if (search)
            qb.andWhere('(t.companyName ILIKE :s OR t.tenantCode ILIKE :s)', { s: `%${search}%` });
        if (plan)
            qb.andWhere('t.subscriptionPlan = :plan', { plan });
        if (status === 'active')
            qb.andWhere('t.isActive = true');
        if (status === 'suspended')
            qb.andWhere('t.isActive = false');
        const tenants = await qb.orderBy('t.createdAt', 'DESC').getMany();
        const userCounts = await this.userRepo.query(`SELECT tenant_id, COUNT(*) as count FROM users GROUP BY tenant_id`);
        const ucMap = userCounts.reduce((acc, r) => { acc[r.tenant_id] = Number(r.count); return acc; }, {});
        let icMap = {};
        try {
            const invCounts = await this.tenantRepo.query(`SELECT tenant_id, COUNT(*) as count FROM sales_invoices GROUP BY tenant_id`);
            icMap = invCounts.reduce((acc, r) => { acc[r.tenant_id] = Number(r.count); return acc; }, {});
        }
        catch { }
        return tenants.map(t => ({ ...t, userCount: ucMap[t.tenantId] || 0, invoiceCount: icMap[t.tenantId] || 0 }));
    }
    async createTenant(dto) {
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
            activeModules: ['core', 'contacts', 'leads', 'sales', 'activities'],
        });
        const savedTenant = await this.tenantRepo.save(tenant);
        if (dto.adminEmail) {
            const hashedPassword = await bcrypt.hash(dto.adminPassword || 'Admin123!', 10);
            await this.userRepo.save(this.userRepo.create({
                tenantId: savedTenant.tenantId, email: dto.adminEmail,
                passwordHash: hashedPassword, fullName: dto.adminName || 'Administrator', isActive: true,
            }));
        }
        return { tenant: savedTenant, message: 'Tenant created successfully' };
    }
    async updateTenant(id, dto) {
        await this.tenantRepo.update({ tenantId: id }, dto);
        return this.tenantRepo.findOne({ where: { tenantId: id } });
    }
    async suspendTenant(id, reason) {
        await this.tenantRepo.update({ tenantId: id }, { isActive: false, suspendedAt: new Date(), suspensionReason: reason });
        return { success: true };
    }
    async activateTenant(id) {
        await this.tenantRepo.update({ tenantId: id }, { isActive: true, suspendedAt: null, suspensionReason: null });
        return { success: true };
    }
    async getTenantStats(id) {
        const userCount = await this.userRepo.count({ where: { tenantId: id } });
        let invoiceCount = 0, invoiceTotal = 0;
        try {
            const inv = await this.tenantRepo.query(`SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total FROM sales_invoices WHERE tenant_id=$1`, [id]);
            invoiceCount = Number(inv[0]?.count || 0);
            invoiceTotal = Number(inv[0]?.total || 0);
        }
        catch { }
        return { invoiceCount, invoiceTotal, userCount };
    }
    async getUsers(tenantId, search) {
        let qb = this.userRepo.createQueryBuilder('u');
        if (tenantId)
            qb.andWhere('u.tenantId = :tenantId', { tenantId });
        if (search)
            qb.andWhere('(u.fullName ILIKE :s OR u.email ILIKE :s)', { s: `%${search}%` });
        return qb.orderBy('u.createdAt', 'DESC').limit(100).getMany();
    }
    async toggleUser(id) {
        const user = await this.userRepo.findOne({ where: { userId: id } });
        if (!user)
            throw new Error('User not found');
        await this.userRepo.update({ userId: id }, { isActive: !user.isActive });
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
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SuperAdminService);
//# sourceMappingURL=superadmin.service.js.map