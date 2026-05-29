import { MastersService } from './masters.service';
import { User } from '../users/entities/user.entity';
import { CreateMasterValueDto, UpdateMasterValueDto, ReorderMasterValuesDto, BulkGetValuesDto } from './dto/create-master-value.dto';
export declare class MastersController {
    private readonly mastersService;
    constructor(mastersService: MastersService);
    getCategories(moduleCode?: string): Promise<import("./entities/master.entity").MasterCategory[]>;
    getAllWithValues(user: User): Promise<import("./entities/master.entity").MasterCategory[]>;
    getBulkValues(user: User, dto: BulkGetValuesDto): Promise<Record<string, import("./entities/master.entity").MasterValue[]>>;
    getValues(user: User, categoryCode: string): Promise<import("./entities/master.entity").MasterValue[]>;
    createValue(user: User, categoryCode: string, dto: CreateMasterValueDto): Promise<import("./entities/master.entity").MasterValue>;
    updateValue(user: User, valueId: string, dto: UpdateMasterValueDto): Promise<import("./entities/master.entity").MasterValue>;
    deleteValue(user: User, valueId: string): Promise<{
        message: string;
    }>;
    reorderValues(user: User, dto: ReorderMasterValuesDto): Promise<{
        message: string;
    }>;
}
