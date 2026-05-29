
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

// Minimal inline entities for accounts/contacts already in DB
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'account_id' }) accountId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'account_name' }) accountName: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) website: string;
  @Column({ nullable: true }) city: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

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
  @Column({ nullable: true }) description: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
