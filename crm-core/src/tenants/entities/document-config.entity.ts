import {
  Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Unique,
} from 'typeorm';

@Entity('document_configs')
@Unique(['tenantId', 'docType'])
export class DocumentConfig {
  @PrimaryGeneratedColumn('uuid', { name: 'config_id' })
  configId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'doc_type' })
  docType: string;

  @Column({ name: 'terms_text', type: 'text', nullable: true })
  termsText: string;

  @Column({ name: 'header_note', type: 'text', nullable: true })
  headerNote: string;

  @Column({ name: 'footer_note', type: 'text', nullable: true })
  footerNote: string;

  @Column({ type: 'jsonb', default: '{}' })
  fields: any;

  @Column({ name: 'items_per_page', default: 15 })
  itemsPerPage: number;

  @Column({ type: 'jsonb', default: '{}' })
  channels: any;

  @Column({ name: 'show_signature', default: true })
  showSignature: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
