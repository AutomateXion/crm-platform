import { Repository } from 'typeorm';
import { MasterCategory } from './entities/master.entity';
import { MasterValue } from './entities/master.entity';
import { CreateMasterValueDto } from './dto/create-master-value.dto';
import { UpdateMasterValueDto } from './dto/update-master-value.dto';
import { ReorderMasterValuesDto } from './dto/reorder-master-values.dto';
export declare class MastersService {
    private readonly categoryRepo;
    private readonly valueRepo;
    constructor(categoryRepo: Repository<MasterCategory>, valueRepo: Repository<MasterValue>);
    getCategories(moduleCode?: string): Promise<MasterCategory[]>;
    getCategory(categoryCode: string): Promise<MasterCategory>;
    getValues(categoryCode: string, tenantId: string): Promise<MasterValue[]>;
    getAllWithValues(tenantId: string): Promise<MasterCategory[]>;
    createValue(tenantId: string, categoryCode: string, dto: CreateMasterValueDto, createdBy: string): Promise<MasterValue>;
    updateValue(tenantId: string, valueId: string, dto: UpdateMasterValueDto): Promise<MasterValue>;
    deleteValue(tenantId: string, valueId: string): Promise<void>;
    reorderValues(tenantId: string, dto: ReorderMasterValuesDto): Promise<void>;
    getBulkValues(tenantId: string, categoryCodes: string[]): Promise<Record<string, MasterValue[]>>;
}
