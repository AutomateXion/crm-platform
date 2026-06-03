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
exports.ContactsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const contacts_entity_1 = require("./contacts.entity");
let ContactsController = class ContactsController {
    constructor(accountRepo, contactRepo) {
        this.accountRepo = accountRepo;
        this.contactRepo = contactRepo;
    }
    async getAccounts(user, q) {
        const page = parseInt(q.page) || 1;
        const limit = parseInt(q.limit) || 20;
        const qb = this.accountRepo.createQueryBuilder('a')
            .where('a.tenantId = :tid AND a.isActive = true', { tid: user.tenantId });
        if (q.search)
            qb.andWhere('a.accountName ILIKE :s', { s: `%${q.search}%` });
        if (q.isSupplier === 'true')
            qb.andWhere('a.isSupplier = true');
        if (q.isCustomer === 'true')
            qb.andWhere('a.isCustomer = true');
        const total = await qb.getCount();
        const data = await qb.skip((page - 1) * limit).take(limit).orderBy('a.accountName', 'ASC').getMany();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async createAccount(user, body) {
        return this.accountRepo.save(this.accountRepo.create({ ...body, tenantId: user.tenantId, createdBy: user.userId }));
    }
    async getAccount(user, id) {
        return this.accountRepo.findOne({ where: { accountId: id, tenantId: user.tenantId } });
    }
    async get360(user, id) {
        const account = await this.accountRepo.findOne({ where: { accountId: id, tenantId: user.tenantId } });
        const contacts = await this.contactRepo.find({ where: { accountId: id, tenantId: user.tenantId, isActive: true } });
        return { account, contacts, notes: [], totals: { contacts: contacts.length, notes: 0 } };
    }
    async updateAccount(user, id, body) {
        await this.accountRepo.update(id, body);
        return this.accountRepo.findOne({ where: { accountId: id } });
    }
    async deleteAccount(user, id) {
        await this.accountRepo.update(id, { isActive: false });
        return { message: 'Account deactivated' };
    }
    async getContacts(user, q) {
        const page = parseInt(q.page) || 1;
        const limit = parseInt(q.limit) || 20;
        const qb = this.contactRepo.createQueryBuilder('c')
            .where('c.tenantId = :tid AND c.isActive = true', { tid: user.tenantId });
        if (q.search)
            qb.andWhere("(c.firstName ILIKE :s OR c.lastName ILIKE :s OR c.email ILIKE :s)", { s: `%${q.search}%` });
        if (q.accountId)
            qb.andWhere('c.accountId = :aid', { aid: q.accountId });
        const total = await qb.getCount();
        const data = await qb.skip((page - 1) * limit).take(limit).orderBy('c.lastName', 'ASC').getMany();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async createContact(user, body) {
        return this.contactRepo.save(this.contactRepo.create({ ...body, tenantId: user.tenantId, createdBy: user.userId }));
    }
    async getContact(user, id) {
        return this.contactRepo.findOne({ where: { contactId: id, tenantId: user.tenantId } });
    }
    async updateContact(user, id, body) {
        await this.contactRepo.update(id, body);
        return this.contactRepo.findOne({ where: { contactId: id } });
    }
    async deleteContact(user, id) {
        await this.contactRepo.update(id, { isActive: false });
        return { message: 'Contact deactivated' };
    }
};
exports.ContactsController = ContactsController;
__decorate([
    (0, common_1.Get)('accounts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Post)('accounts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Get)('accounts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getAccount", null);
__decorate([
    (0, common_1.Get)('accounts/:id/360'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "get360", null);
__decorate([
    (0, common_1.Put)('accounts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "updateAccount", null);
__decorate([
    (0, common_1.Delete)('accounts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Get)('contacts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getContacts", null);
__decorate([
    (0, common_1.Post)('contacts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "createContact", null);
__decorate([
    (0, common_1.Get)('contacts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getContact", null);
__decorate([
    (0, common_1.Put)('contacts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "updateContact", null);
__decorate([
    (0, common_1.Delete)('contacts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "deleteContact", null);
exports.ContactsController = ContactsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __param(0, (0, typeorm_1.InjectRepository)(contacts_entity_1.AccountEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(contacts_entity_1.ContactEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ContactsController);
//# sourceMappingURL=contacts.controller.js.map