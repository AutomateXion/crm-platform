import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Or } from 'typeorm';

import { MasterCategory } from './entities/master.entity';
import { MasterValue } from './entities/master.entity';
import { CreateMasterValueDto } from './dto/create-master-value.dto';
import { UpdateMasterValueDto } from './dto/update-master-value.dto';
import { ReorderMasterValuesDto } from './dto/reorder-master-values.dto';

@Injectable()
export class MastersService {
  constructor(
    @InjectRepository(MasterCategory)
    private readonly categoryRepo: Repository<MasterCategory>,
    @InjectRepository(MasterValue)
    private readonly valueRepo: Repository<MasterValue>,
  ) {}

  // ─── Categories ───────────────────────────────────────────────

  async getCategories(moduleCode?: string): Promise<MasterCategory[]> {
    const query = this.categoryRepo.createQueryBuilder('c')
      .where('c.isActive = true')
      .orderBy('c.sortOrder', 'ASC');

    if (moduleCode) {
      query.leftJoin('modules', 'm', 'm.module_id = c.module_id')
        .andWhere('m.module_code = :moduleCode', { moduleCode });
    }

    return query.getMany();
  }

  async getCategory(categoryCode: string): Promise<MasterCategory> {
    const cat = await this.categoryRepo.findOne({ where: { categoryCode, isActive: true } });
    if (!cat) throw new NotFoundException(`Category '${categoryCode}' not found`);
    return cat;
  }

  // ─── Values ───────────────────────────────────────────────────

  // Get all values for a category (global + tenant-specific)
  async getValues(categoryCode: string, tenantId: string): Promise<MasterValue[]> {
    const category = await this.getCategory(categoryCode);

    return this.valueRepo.find({
      where: [
        { categoryId: category.categoryId, tenantId: IsNull(), isActive: true },
        { categoryId: category.categoryId, tenantId, isActive: true },
      ],
      order: { sortOrder: 'ASC', valueLabel: 'ASC' },
    });
  }

  // Get all categories with their values (for admin master management page)
  async getAllWithValues(tenantId: string): Promise<MasterCategory[]> {
    const categories = await this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });

    for (const cat of categories) {
      cat.values = await this.valueRepo.find({
        where: [
          { categoryId: cat.categoryId, tenantId: IsNull(), isActive: true },
          { categoryId: cat.categoryId, tenantId, isActive: true },
        ],
        order: { sortOrder: 'ASC' },
      });
    }

    return categories;
  }

  async createValue(
    tenantId: string,
    categoryCode: string,
    dto: CreateMasterValueDto,
    createdBy: string,
  ): Promise<MasterValue> {
    const category = await this.getCategory(categoryCode);

    const existing = await this.valueRepo.findOne({
      where: { categoryId: category.categoryId, tenantId, valueCode: dto.valueCode.toUpperCase() },
    });
    if (existing) throw new ConflictException(`Value code '${dto.valueCode}' already exists`);

    const value = this.valueRepo.create({
      categoryId: category.categoryId,
      tenantId,
      valueCode: dto.valueCode.toUpperCase(),
      valueLabel: dto.valueLabel,
      valueLabelAr: dto.valueLabelAr,
      description: dto.description,
      colorCode: dto.colorCode,
      iconCode: dto.iconCode,
      isDefault: dto.isDefault || false,
      parentValueId: dto.parentValueId,
      metadata: dto.metadata || {},
      sortOrder: dto.sortOrder || 0,
      createdBy,
      updatedAt: new Date(),
    });

    // If this is set as default, unset others
    if (dto.isDefault) {
      await this.valueRepo.update(
        { categoryId: category.categoryId, tenantId },
        { isDefault: false },
      );
    }

    return this.valueRepo.save(value);
  }

  async updateValue(
    tenantId: string,
    valueId: string,
    dto: UpdateMasterValueDto,
  ): Promise<MasterValue> {
    const value = await this.valueRepo.findOne({ where: { valueId } });
    if (!value) throw new NotFoundException('Value not found');

    // Cannot edit system global values
    if (value.isSystem && !value.tenantId) {
      throw new ForbiddenException('System values cannot be modified');
    }

    if (dto.isDefault) {
      await this.valueRepo.update(
        { categoryId: value.categoryId, tenantId },
        { isDefault: false },
      );
    }

    Object.assign(value, dto, { updatedAt: new Date() });
    return this.valueRepo.save(value);
  }

  async deleteValue(tenantId: string, valueId: string): Promise<void> {
    const value = await this.valueRepo.findOne({ where: { valueId } });
    if (!value) throw new NotFoundException('Value not found');
    if (value.isSystem) throw new ForbiddenException('System values cannot be deleted');
    if (!value.tenantId) throw new ForbiddenException('Global values cannot be deleted');
    if (value.tenantId !== tenantId) throw new ForbiddenException('Access denied');

    await this.valueRepo.update(valueId, { isActive: false });
  }

  async reorderValues(tenantId: string, dto: ReorderMasterValuesDto): Promise<void> {
    for (const item of dto.items) {
      await this.valueRepo.update(item.valueId, { sortOrder: item.sortOrder });
    }
  }

  // Bulk get values for multiple categories in one call
  // Used by modules on page load to fetch all needed master data at once
  async getBulkValues(
    tenantId: string,
    categoryCodes: string[] | string | undefined,
  ): Promise<Record<string, MasterValue[]>> {
    const result: Record<string, MasterValue[]> = {};

    const codes = Array.isArray(categoryCodes)
      ? categoryCodes
      : typeof categoryCodes === 'string' && categoryCodes.length
        ? [categoryCodes]
        : [];
    for (const code of codes) {
      try {
        result[code] = await this.getValues(code, tenantId);
      } catch {
        result[code] = [];
      }
    }

    return result;
  }
}
