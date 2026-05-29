import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUserGroup(user: User, dto: CreateUserGroupDto): Promise<import("./entities/user-group.entity").UserGroup>;
    getUserGroups(user: User): Promise<import("./entities/user-group.entity").UserGroup[]>;
    getUserGroup(user: User, id: string): Promise<import("./entities/user-group.entity").UserGroup>;
    updateUserGroup(user: User, id: string, dto: UpdateUserGroupDto): Promise<import("./entities/user-group.entity").UserGroup>;
    deleteUserGroup(user: User, id: string): Promise<{
        message: string;
    }>;
    createUser(user: User, dto: CreateUserDto): Promise<User>;
    getUsers(user: User, page?: number, limit?: number, search?: string, userGroupId?: string, isActive?: boolean): Promise<import("./users.service").PaginatedResult<User>>;
    getUser(user: User, id: string): Promise<User>;
    updateUser(user: User, id: string, dto: UpdateUserDto): Promise<User>;
    toggleStatus(user: User, id: string, isActive: boolean): Promise<{
        message: string;
    }>;
    resetPassword(user: User, id: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(user: User, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
