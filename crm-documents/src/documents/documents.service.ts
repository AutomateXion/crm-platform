import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private readonly repo: Repository<Document>,
  ) {}

  async create(tenantId: string, dto: Partial<Document>, uploadedBy: string): Promise<Document> {
    return this.repo.save(this.repo.create({ ...dto, tenantId, uploadedBy }));
  }

  async findAll(tenantId: string, params: {
    page?: number; limit?: number; search?: string;
    relatedToType?: string; relatedToId?: string;
    documentTypeId?: string; expiringDays?: number;
  }) {
    const { page = 1, limit = 20, search, relatedToType, relatedToId, documentTypeId, expiringDays } = params;
    const qb = this.repo.createQueryBuilder('d')
      .where('d.tenantId = :tenantId AND d.isActive = true', { tenantId });

    if (search) qb.andWhere('d.documentName ILIKE :s', { s: `%${search}%` });
    if (relatedToType) qb.andWhere('d.relatedToType = :relatedToType', { relatedToType });
    if (relatedToId) qb.andWhere('d.relatedToId = :relatedToId', { relatedToId });
    if (documentTypeId) qb.andWhere('d.documentTypeId = :documentTypeId', { documentTypeId });
    if (expiringDays) {
      const future = new Date(Date.now() + expiringDays * 86400 * 1000);
      qb.andWhere('d.expiryDate <= :future AND d.expiryDate >= NOW()', { future });
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit)
      .orderBy('d.createdAt', 'DESC').getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, documentId: string): Promise<Document> {
    const doc = await this.repo.findOne({ where: { documentId, tenantId, isActive: true } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(tenantId: string, documentId: string, dto: Partial<Document>): Promise<Document> {
    const doc = await this.findOne(tenantId, documentId);
    Object.assign(doc, dto);
    return this.repo.save(doc);
  }

  async delete(tenantId: string, documentId: string): Promise<void> {
    await this.findOne(tenantId, documentId);
    await this.repo.update(documentId, { isActive: false });
  }

  // Upload new version of existing document
  async uploadNewVersion(tenantId: string, documentId: string, dto: Partial<Document>, uploadedBy: string): Promise<Document> {
    const original = await this.findOne(tenantId, documentId);
    return this.repo.save(this.repo.create({
      ...dto,
      tenantId,
      documentName: original.documentName,
      documentTypeId: original.documentTypeId,
      relatedToType: original.relatedToType,
      relatedToId: original.relatedToId,
      relatedToName: original.relatedToName,
      parentDocumentId: documentId,
      version: original.version + 1,
      uploadedBy,
    }));
  }

  async getVersionHistory(tenantId: string, documentId: string): Promise<Document[]> {
    return this.repo.find({
      where: [
        { documentId, tenantId },
        { parentDocumentId: documentId, tenantId },
      ],
      order: { version: 'DESC' },
    });
  }

  // Generate shareable link
  async generateShareLink(tenantId: string, documentId: string, expiresInDays = 7): Promise<{ shareUrl: string; expiresAt: Date }> {
    const doc = await this.findOne(tenantId, documentId);
    const token = uuidv4().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + expiresInDays * 86400 * 1000);
    await this.repo.update(documentId, { isShared: true, shareToken: token, shareExpiresAt: expiresAt });
    return {
      shareUrl: `${process.env.FRONTEND_URL}/shared/documents/${token}`,
      expiresAt,
    };
  }

  // Get expiring documents
  async getExpiringDocuments(tenantId: string, days = 30): Promise<Document[]> {
    const future = new Date(Date.now() + days * 86400 * 1000);
    return this.repo.createQueryBuilder('d')
      .where('d.tenantId = :tenantId AND d.isActive = true', { tenantId })
      .andWhere('d.expiryDate <= :future AND d.expiryDate >= NOW()', { future })
      .orderBy('d.expiryDate', 'ASC')
      .getMany();
  }
}
