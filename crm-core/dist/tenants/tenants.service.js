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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("./entities/tenant.entity");
const user_group_entity_1 = require("../users/entities/user-group.entity");
const user_entity_1 = require("../users/entities/user.entity");
const bcrypt = require("bcryptjs");
let TenantsService = class TenantsService {
    constructor(tenantRepo, groupRepo, userRepo) {
        this.tenantRepo = tenantRepo;
        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
    }
    async getTenant(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return tenant;
    }
    async updateTenant(tenantId, dto) {
        const tenant = await this.getTenant(tenantId);
        Object.assign(tenant, dto);
        return this.tenantRepo.save(tenant);
    }
    async updateActiveModules(tenantId, modules) {
        const tenant = await this.getTenant(tenantId);
        if (!modules.includes('core'))
            modules.unshift('core');
        tenant.activeModules = modules;
        return this.tenantRepo.save(tenant);
    }
    async createTenant(dto) {
        const existing = await this.tenantRepo.findOne({
            where: { tenantCode: dto.tenantCode.toUpperCase() },
        });
        if (existing)
            throw new common_1.ConflictException('Tenant code already in use');
        const tenant = await this.tenantRepo.save(this.tenantRepo.create({
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
        }));
        const adminGroup = await this.groupRepo.save(this.groupRepo.create({
            tenantId: tenant.tenantId,
            groupCode: 'TENANT_ADMIN',
            groupName: 'Tenant Administrator',
            groupNameAr: 'مدير النظام',
            isSystemGroup: true,
            description: 'Full access to all tenant features',
        }));
        const adminUser = await this.userRepo.save(this.userRepo.create({
            tenantId: tenant.tenantId,
            userGroupId: adminGroup.userGroupId,
            email: dto.adminEmail.toLowerCase(),
            fullName: dto.adminName,
            passwordHash: await bcrypt.hash(dto.adminPassword, 10),
            isActive: true,
            isEmailVerified: true,
        }));
        return { tenant, adminUser };
    }
    async getAllTenants() {
        return this.tenantRepo.find({ order: { companyName: 'ASC' } });
    }
    async getEmailConfig(tenantId) {
        const tenant = await this.getTenant(tenantId);
        const settings = tenant.settings || {};
        const emailConfig = settings.emailConfig || {};
        const { password: _, ...safeConfig } = emailConfig;
        return safeConfig;
    }
    async saveEmailConfig(tenantId, dto) {
        const tenant = await this.getTenant(tenantId);
        const settings = tenant.settings || {};
        const existing = settings.emailConfig || {};
        const newConfig = { ...existing, ...dto, password: dto.password ? dto.password : existing.password };
        settings.emailConfig = newConfig;
        await this.tenantRepo.update({ tenantId }, { settings });
        const { password: _, ...safeConfig } = newConfig;
        return { success: true, config: safeConfig };
    }
    async testEmailConfig(tenantId, to) {
        const tenant = await this.getTenant(tenantId);
        const settings = tenant.settings || {};
        const cfg = settings.emailConfig;
        if (!cfg?.host || !cfg?.username || !cfg?.password) {
            throw new Error('Email not configured. Please save configuration first.');
        }
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
    async getAccountingConfig(tenantId) {
        const tenant = await this.getTenant(tenantId);
        const settings = tenant.settings || {};
        return settings.accountingConfig || {
            accountsReceivable: '1130', salesRevenue: '4100', salesReturns: '4010',
            vatPayable: '2121', vatReceivable: '1160', accountsPayable: '2110',
            inventory: '1140', grni: '1141', cogs: '5001', purchaseReturns: '5010', cashBank: '1120',
        };
    }
    async saveAccountingConfig(tenantId, dto) {
        const tenant = await this.getTenant(tenantId);
        const settings = tenant.settings || {};
        settings.accountingConfig = dto;
        await this.tenantRepo.update({ tenantId }, { settings });
        return { success: true, config: dto };
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(user_group_entity_1.UserGroup)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map