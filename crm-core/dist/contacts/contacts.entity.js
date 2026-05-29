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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityEntity = exports.OpportunityEntity = exports.LeadEntity = exports.ContactEntity = exports.AccountEntity = void 0;
const typeorm_1 = require("typeorm");
let AccountEntity = class AccountEntity {
};
exports.AccountEntity = AccountEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'account_id' }),
    __metadata("design:type", String)
], AccountEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], AccountEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name' }),
    __metadata("design:type", String)
], AccountEntity.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AccountEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AccountEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AccountEntity.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AccountEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_name', nullable: true }),
    __metadata("design:type", String)
], AccountEntity.prototype, "locationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], AccountEntity.prototype, "locationLat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], AccountEntity.prototype, "locationLng", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_address', nullable: true }),
    __metadata("design:type", String)
], AccountEntity.prototype, "locationAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maps_url', nullable: true }),
    __metadata("design:type", String)
], AccountEntity.prototype, "mapsUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], AccountEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], AccountEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AccountEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AccountEntity.prototype, "updatedAt", void 0);
exports.AccountEntity = AccountEntity = __decorate([
    (0, typeorm_1.Entity)('accounts')
], AccountEntity);
let ContactEntity = class ContactEntity {
};
exports.ContactEntity = ContactEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'contact_id' }),
    __metadata("design:type", String)
], ContactEntity.prototype, "contactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], ContactEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name' }),
    __metadata("design:type", String)
], ContactEntity.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_title', nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "jobTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_name', nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "locationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], ContactEntity.prototype, "locationLat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], ContactEntity.prototype, "locationLng", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_address', nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "locationAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maps_url', nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "mapsUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'do_not_contact', default: false }),
    __metadata("design:type", Boolean)
], ContactEntity.prototype, "doNotContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'do_not_email', default: false }),
    __metadata("design:type", Boolean)
], ContactEntity.prototype, "doNotEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ContactEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], ContactEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ContactEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ContactEntity.prototype, "updatedAt", void 0);
exports.ContactEntity = ContactEntity = __decorate([
    (0, typeorm_1.Entity)('contacts')
], ContactEntity);
const typeorm_2 = require("typeorm");
let LeadEntity = class LeadEntity {
};
exports.LeadEntity = LeadEntity;
__decorate([
    (0, typeorm_2.PrimaryGeneratedColumn)('uuid', { name: 'lead_id' }),
    __metadata("design:type", String)
], LeadEntity.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], LeadEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'lead_number', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "leadNumber", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'first_name', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'last_name', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'company_name', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'job_title', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "jobTitle", void 0);
__decorate([
    (0, typeorm_2.Column)({ nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_2.Column)({ nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'lead_status_code', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "leadStatusCode", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'lead_source_code', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "leadSourceCode", void 0);
__decorate([
    (0, typeorm_2.Column)({ nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'estimated_value', type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], LeadEntity.prototype, "estimatedValue", void 0);
__decorate([
    (0, typeorm_2.Column)({ nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'lead_score', default: 0 }),
    __metadata("design:type", Number)
], LeadEntity.prototype, "leadScore", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'assigned_to', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'contact_id', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "contactId", void 0);
__decorate([
    (0, typeorm_2.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LeadEntity.prototype, "converted", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'converted_account_id', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "convertedAccountId", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'converted_contact_id', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "convertedContactId", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'converted_opportunity_id', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "convertedOpportunityId", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], LeadEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_2.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], LeadEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_2.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LeadEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_2.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], LeadEntity.prototype, "updatedAt", void 0);
exports.LeadEntity = LeadEntity = __decorate([
    (0, typeorm_2.Entity)('leads')
], LeadEntity);
const typeorm_3 = require("typeorm");
let OpportunityEntity = class OpportunityEntity {
};
exports.OpportunityEntity = OpportunityEntity;
__decorate([
    (0, typeorm_3.PrimaryGeneratedColumn)('uuid', { name: 'opportunity_id' }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "opportunityId", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'opportunity_number', nullable: true }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "opportunityNumber", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'opportunity_name' }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "opportunityName", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'contact_id', nullable: true }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "contactId", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'lead_id', nullable: true }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'account_name', nullable: true }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'contact_name', nullable: true }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "contactName", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'stage_code', default: 'PROSPECTING' }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "stageCode", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'deal_value', type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], OpportunityEntity.prototype, "dealValue", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'currency_code', default: 'OMR' }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_3.Column)({ default: 0 }),
    __metadata("design:type", Number)
], OpportunityEntity.prototype, "probability", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'expected_close', nullable: true }),
    __metadata("design:type", Date)
], OpportunityEntity.prototype, "expectedClose", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'next_step', nullable: true }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "nextStep", void 0);
__decorate([
    (0, typeorm_3.Column)({ nullable: true }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'assigned_to', nullable: true }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'original_close_date', nullable: true }),
    __metadata("design:type", Date)
], OpportunityEntity.prototype, "originalCloseDate", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'stage_entered_at', nullable: true }),
    __metadata("design:type", Date)
], OpportunityEntity.prototype, "stageEnteredAt", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'stage_history', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], OpportunityEntity.prototype, "stageHistory", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], OpportunityEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_3.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], OpportunityEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_3.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], OpportunityEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_3.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], OpportunityEntity.prototype, "updatedAt", void 0);
exports.OpportunityEntity = OpportunityEntity = __decorate([
    (0, typeorm_3.Entity)('opportunities')
], OpportunityEntity);
const typeorm_4 = require("typeorm");
let ActivityEntity = class ActivityEntity {
};
exports.ActivityEntity = ActivityEntity;
__decorate([
    (0, typeorm_4.PrimaryGeneratedColumn)('uuid', { name: 'activity_id' }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "activityId", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'activity_type', default: 'CALL' }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "activityType", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'subject' }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "subject", void 0);
__decorate([
    (0, typeorm_4.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_4.Column)({ default: 'PLANNED' }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_4.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "outcome", void 0);
__decorate([
    (0, typeorm_4.Column)({ default: 'MEDIUM' }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "priority", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'due_date', nullable: true }),
    __metadata("design:type", Date)
], ActivityEntity.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'start_date', nullable: true }),
    __metadata("design:type", Date)
], ActivityEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'completed_date', nullable: true }),
    __metadata("design:type", Date)
], ActivityEntity.prototype, "completedDate", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'duration_minutes', nullable: true }),
    __metadata("design:type", Number)
], ActivityEntity.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_4.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "location", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'related_to_type', nullable: true }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "relatedToType", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'related_to_id', nullable: true }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "relatedToId", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'related_to_name', nullable: true }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "relatedToName", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'assigned_to', nullable: true }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'assigned_to_name', nullable: true }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "assignedToName", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'is_private', default: false }),
    __metadata("design:type", Boolean)
], ActivityEntity.prototype, "isPrivate", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_4.Column)({ name: 'created_by_name', nullable: true }),
    __metadata("design:type", String)
], ActivityEntity.prototype, "createdByName", void 0);
__decorate([
    (0, typeorm_4.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ActivityEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_4.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ActivityEntity.prototype, "updatedAt", void 0);
exports.ActivityEntity = ActivityEntity = __decorate([
    (0, typeorm_4.Entity)('activities')
], ActivityEntity);
//# sourceMappingURL=contacts.entity.js.map