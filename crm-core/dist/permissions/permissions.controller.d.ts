import { PermissionsService } from './permissions.service';
import { SetPermissionsDto } from './dto/set-permissions.dto';
import { CopyPermissionsDto } from './dto/copy-permissions.dto';
import { User } from '../users/entities/user.entity';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    getMyPermissions(user: User): Promise<import("./permissions.service").PermissionMap>;
    getModuleHierarchy(): Promise<import("./entities/module.entity").AppModule[]>;
    getPermissionsGrid(user: User, userGroupId: string): Promise<{
        group: import("../users/entities/user-group.entity").UserGroup;
        hierarchy: import("./entities/module.entity").AppModule[];
        permMap: {
            [k: string]: import("./entities/permission.entity").PermissionLevel;
        };
    }>;
    setPermissions(user: User, dto: SetPermissionsDto): Promise<{
        message: string;
    }>;
    copyPermissions(user: User, dto: CopyPermissionsDto): Promise<{
        message: string;
    }>;
}
