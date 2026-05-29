// ─── document.entity.ts ───────────────────────────────────────────────────────
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('documents')
@Index(['tenantId'])
@Index(['relatedToType', 'relatedToId'])
export class Document {
  @PrimaryGeneratedColumn('uuid') documentId: string;
  @Column({ name: 'tenant_id' }) tenantId: string;
  @Column({ name: 'document_name' }) documentName: string;
  @Column({ name: 'document_type_id', nullable: true }) documentTypeId: string;
  @Column({ name: 'file_name', nullable: true }) fileName: string;
  @Column({ name: 'file_size', type: 'bigint', nullable: true }) fileSize: number;
  @Column({ name: 'mime_type', nullable: true }) mimeType: string;
  @Column({ name: 'storage_key', nullable: true }) storageKey: string;
  @Column({ name: 'storage_url', nullable: true }) storageUrl: string;
  @Column({ default: 1 }) version: number;
  @Column({ name: 'parent_document_id', nullable: true }) parentDocumentId: string;
  @Column({ name: 'related_to_type', nullable: true }) relatedToType: string;
  @Column({ name: 'related_to_id', nullable: true }) relatedToId: string;
  @Column({ name: 'related_to_name', nullable: true }) relatedToName: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'text', array: true, default: '{}' }) tags: string[];
  @Column({ name: 'expiry_date', nullable: true }) expiryDate: Date;
  @Column({ name: 'is_shared', default: false }) isShared: boolean;
  @Column({ name: 'share_token', nullable: true }) shareToken: string;
  @Column({ name: 'share_expires_at', nullable: true }) shareExpiresAt: Date;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'uploaded_by', nullable: true }) uploadedBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
