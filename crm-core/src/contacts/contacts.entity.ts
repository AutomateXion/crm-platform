import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// ─── Account Entity ───────────────────────────────────────────────────────────
@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'account_id' }) accountId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'account_name' }) accountName: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) website: string;
  @Column({ nullable: true }) city: string;
  @Column({ name: 'location_name', nullable: true }) locationName: string;
  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true }) locationLat: number;
  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true }) locationLng: number;
  @Column({ name: 'location_address', nullable: true }) locationAddress: string;
  @Column({ name: 'maps_url', nullable: true }) mapsUrl: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'address_line1', nullable: true }) addressLine1: string;
  @Column({ name: 'is_customer', default: true }) isCustomer: boolean;
  @Column({ name: 'is_supplier', default: false }) isSupplier: boolean;
  @Column({ nullable: true }) trn: string;
  @Column({ name: 'credit_limit', type: 'decimal', precision: 18, scale: 3, default: 0 }) creditLimit: number;
  @Column({ name: 'credit_period_days', type: 'int', default: 0 }) creditPeriodDays: number;
  @Column({ name: 'payment_terms', nullable: true }) paymentTerms: string;
  @Column({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @Column({ name: 'bank_name', nullable: true }) bankName: string;
  @Column({ name: 'bank_account', nullable: true }) bankAccount: string;
  @Column({ name: 'bank_iban', nullable: true }) bankIban: string;
  @Column({ name: 'address_line2', nullable: true }) addressLine2: string;
  @Column({ nullable: true }) state: string;
  @Column({ name: 'zip_code', nullable: true }) zipCode: string;
  @Column({ name: 'po_box', nullable: true }) poBox: string;
  @Column({ nullable: true }) fax: string;
  @Column({ name: 'contact_person', nullable: true }) contactPerson: string;
  @Column({ name: 'account_code', nullable: true }) accountCode: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @Column({ name: 'salesman_id', nullable: true }) salesmanId: string;
  @Column({ name: 'salesman_name', nullable: true }) salesmanName: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ─── Contact Entity ───────────────────────────────────────────────────────────
@Entity('contacts')
export class ContactEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'contact_id' }) contactId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'first_name' }) firstName: string;
  @Column({ name: 'last_name', nullable: true }) lastName: string;
  @Column({ name: 'job_title', nullable: true }) jobTitle: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) mobile: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) department: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'location_name', nullable: true }) locationName: string;
  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true }) locationLat: number;
  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true }) locationLng: number;
  @Column({ name: 'location_address', nullable: true }) locationAddress: string;
  @Column({ name: 'maps_url', nullable: true }) mapsUrl: string;
  @Column({ name: 'do_not_contact', default: false }) doNotContact: boolean;
  @Column({ name: 'do_not_email', default: false }) doNotEmail: boolean;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

import { Entity as LeadEnt, PrimaryGeneratedColumn as LeadPGC, Column as LeadCol, CreateDateColumn as LeadCDC, UpdateDateColumn as LeadUDC } from 'typeorm';

// ─── Lead Entity ──────────────────────────────────────────────────────────────
@LeadEnt('leads')
export class LeadEntity {
  @LeadPGC('uuid', { name: 'lead_id' }) leadId: string;
  @LeadCol({ name: 'tenant_id' }) tenantId: string;
  @LeadCol({ name: 'lead_number', nullable: true }) leadNumber: string;
  @LeadCol({ name: 'first_name', nullable: true }) firstName: string;
  @LeadCol({ name: 'last_name', nullable: true }) lastName: string;
  @LeadCol({ name: 'company_name', nullable: true }) companyName: string;
  @LeadCol({ name: 'job_title', nullable: true }) jobTitle: string;
  @LeadCol({ nullable: true }) email: string;
  @LeadCol({ nullable: true }) phone: string;
  @LeadCol({ name: 'lead_status_code', nullable: true }) leadStatusCode: string;
  @LeadCol({ name: 'lead_source_code', nullable: true }) leadSourceCode: string;
  @LeadCol({ nullable: true }) city: string;
  @LeadCol({ name: 'estimated_value', type: 'decimal', precision: 18, scale: 2, nullable: true }) estimatedValue: number;
  @LeadCol({ nullable: true }) description: string;
  @LeadCol({ name: 'lead_score', default: 0 }) leadScore: number;
  @LeadCol({ name: 'assigned_to', nullable: true }) assignedTo: string;
  @LeadCol({ name: 'account_id', nullable: true }) accountId: string;
  @LeadCol({ name: 'contact_id', nullable: true }) contactId: string;
  @LeadCol({ default: false }) converted: boolean;
  @LeadCol({ name: 'converted_account_id', nullable: true }) convertedAccountId: string;
  @LeadCol({ name: 'converted_contact_id', nullable: true }) convertedContactId: string;
  @LeadCol({ name: 'converted_opportunity_id', nullable: true }) convertedOpportunityId: string;
  @LeadCol({ name: 'is_active', default: true }) isActive: boolean;
  @LeadCol({ name: 'created_by', nullable: true }) createdBy: string;
  @LeadCDC({ name: 'created_at' }) createdAt: Date;
  @LeadUDC({ name: 'updated_at' }) updatedAt: Date;
}

import { Entity as OppEnt, PrimaryGeneratedColumn as OppPGC, Column as OppCol, CreateDateColumn as OppCDC, UpdateDateColumn as OppUDC } from 'typeorm';

// ─── Opportunity Entity ───────────────────────────────────────────────────────
@Entity('opportunity_items')
export class OpportunityItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' }) itemId: string;
  @Column({ name: 'opportunity_id' }) opportunityId: string;
  @Column({ name: 'product_id', nullable: true }) productId: string;
  @Column({ name: 'item_code', nullable: true }) itemCode: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 3, default: 0 }) unitPrice: number;
  @Column({ name: 'unit_of_measure', default: 'PCS' }) unitOfMeasure: string;
  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 }) discountPct: number;
  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 3, default: 0 }) lineTotal: number;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'line_number', default: 1 }) lineNumber: number;
}

@Entity('opportunities')
export class OpportunityEntity {
  @OppPGC('uuid', { name: 'opportunity_id' }) opportunityId: string;
  @OppCol({ name: 'tenant_id' }) tenantId: string;
  @OppCol({ name: 'opportunity_number', nullable: true }) opportunityNumber: string;
  @OppCol({ name: 'opportunity_name' }) opportunityName: string;
  @OppCol({ name: 'account_id', nullable: true }) accountId: string;
  @OppCol({ name: 'contact_id', nullable: true }) contactId: string;
  @OppCol({ name: 'lead_id', nullable: true }) leadId: string;
  @OppCol({ name: 'account_name', nullable: true }) accountName: string;
  @OppCol({ name: 'contact_name', nullable: true }) contactName: string;
  @OppCol({ name: 'stage_code', default: 'PROSPECTING' }) stageCode: string;
  @OppCol({ name: 'deal_value', type: 'decimal', precision: 18, scale: 2, nullable: true }) dealValue: number;
  @OppCol({ name: 'currency_code', default: 'OMR' }) currencyCode: string;
  @OppCol({ default: 0 }) probability: number;
  @OppCol({ name: 'expected_close', nullable: true }) expectedClose: Date;
  @OppCol({ name: 'next_step', nullable: true }) nextStep: string;
  @OppCol({ nullable: true }) description: string;
  @OppCol({ name: 'assigned_to', nullable: true }) assignedTo: string;
  @OppCol({ name: 'original_close_date', nullable: true }) originalCloseDate: Date;
  @OppCol({ name: 'stage_entered_at', nullable: true }) stageEnteredAt: Date;
  @OppCol({ name: 'stage_history', type: 'jsonb', default: '[]' }) stageHistory: any[];
  @OppCol({ name: 'is_active', default: true }) isActive: boolean;
  @OppCol({ name: 'converted_to_quotation', default: false }) convertedToQuotation: boolean;
  @OppCol({ name: 'created_by', nullable: true }) createdBy: string;
  @OppCDC({ name: 'created_at' }) createdAt: Date;
  @OppUDC({ name: 'updated_at' }) updatedAt: Date;
}

import { Entity as ActEnt, PrimaryGeneratedColumn as ActPGC, Column as ActCol, CreateDateColumn as ActCDC, UpdateDateColumn as ActUDC } from 'typeorm';

@ActEnt('activities')
export class ActivityEntity {
  @ActPGC('uuid', { name: 'activity_id' }) activityId: string;
  @ActCol({ name: 'tenant_id' }) tenantId: string;
  @ActCol({ name: 'activity_type', default: 'CALL' }) activityType: string;
  @ActCol({ name: 'subject' }) subject: string;
  @ActCol({ nullable: true }) description: string;
  @ActCol({ default: 'PLANNED' }) status: string;
  @ActCol({ nullable: true }) outcome: string;
  @ActCol({ default: 'MEDIUM' }) priority: string;
  @ActCol({ name: 'due_date', nullable: true }) dueDate: Date;
  @ActCol({ name: 'start_date', nullable: true }) startDate: Date;
  @ActCol({ name: 'completed_date', nullable: true }) completedDate: Date;
  @ActCol({ name: 'duration_minutes', nullable: true }) durationMinutes: number;
  @ActCol({ nullable: true }) location: string;
  @ActCol({ name: 'related_to_type', nullable: true }) relatedToType: string;
  @ActCol({ name: 'related_to_id', nullable: true }) relatedToId: string;
  @ActCol({ name: 'related_to_name', nullable: true }) relatedToName: string;
  @ActCol({ name: 'assigned_to', nullable: true }) assignedTo: string;
  @ActCol({ name: 'assigned_to_name', nullable: true }) assignedToName: string;
  @ActCol({ name: 'is_private', default: false }) isPrivate: boolean;
  @ActCol({ name: 'created_by', nullable: true }) createdBy: string;
  @ActCol({ name: 'created_by_name', nullable: true }) createdByName: string;
  @ActCDC({ name: 'created_at' }) createdAt: Date;
  @ActUDC({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('customer_visits')
export class CustomerVisitEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'visit_id' }) visitId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'account_id', nullable: true }) accountId: string;
  @Column({ name: 'account_name', nullable: true }) accountName: string;
  @Column({ name: 'salesman_id', nullable: true }) salesmanId: string;
  @Column({ name: 'salesman_name', nullable: true }) salesmanName: string;
  @Column({ name: 'visit_date', type: 'timestamp', nullable: true }) visitDate: Date;
  @Column({ name: 'check_in_lat', type: 'decimal', precision: 10, scale: 7, nullable: true }) checkInLat: number;
  @Column({ name: 'check_in_lng', type: 'decimal', precision: 10, scale: 7, nullable: true }) checkInLng: number;
  @Column({ name: 'check_in_address', nullable: true }) checkInAddress: string;
  @Column({ name: 'check_out_time', type: 'timestamp', nullable: true }) checkOutTime: Date;
  @Column({ name: 'duration_minutes', nullable: true }) durationMinutes: number;
  @Column({ nullable: true }) purpose: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ default: 'CHECKED_IN' }) status: string;
  @Column({ type: 'jsonb', default: '[]' }) photos: string[];
  @Column({ nullable: true }) outcome: string;
  @Column({ name: 'next_action', nullable: true }) nextAction: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
