import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
 
import { Permission, PermissionLevel } from './entities/permission.entity';
import { AppModule } from './entities/module.entity';
import { SubModule, Page, Field } from './entities/sub-module.entity';
import { UserGroup } from '../users/entities/user-group.entity';
import { SetPermissionsDto } from './dto/set-permissions.dto';

export interface PermissionMap {
  modules: Record<string, ModulePermission>;
}

export interface ModulePermission {
  level: PermissionLevel;
  subModules: Record<string, SubModulePermission>;
}

export interface SubModulePermission {
  level: PermissionLevel;
  pages: Record<string, PagePermission>;
}

export interface PagePermission {
  level: PermissionLevel;
  fields: Record<string, PermissionLevel>;
}

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(AppModule)
    private readonly moduleRepo: Repository<AppModule>,
    @InjectRepository(SubModule)
    private readonly subModuleRepo: Repository<SubModule>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(Field)
    private readonly fieldRepo: Repository<Field>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepo: Repository<UserGroup>,

  ) {}

  // ─── Get Full Permission Map for a User Group ─────────────────
  // This is called on login — returns the complete nested permission map
  // Frontend stores this and checks it before rendering anything
  async getPermissionMap(tenantId: string, userGroupId: string): Promise<PermissionMap> {
    // Cache disabled

    const permissions = await this.permissionRepo.find({
      where: { tenantId, userGroupId },
    });

    const modules = await this.moduleRepo.find({
      where: { isActive: true },
      relations: ['subModules', 'subModules.pages', 'subModules.pages.fields'],
      order: { sortOrder: 'ASC' },
    });

    const map: PermissionMap = { modules: {} };

    for (const mod of modules) {
      const modPerm = permissions.find(
        p => p.moduleId === mod.moduleId && !p.subModuleId && !p.pageId && !p.fieldId,
      );
      const modLevel = modPerm?.permissionLevel ?? PermissionLevel.NO_ACCESS;

      map.modules[mod.moduleCode] = {
        level: modLevel,
        subModules: {},
      };

      for (const sub of mod.subModules || []) {
        const subPerm = permissions.find(
          p => p.subModuleId === sub.subModuleId && !p.pageId && !p.fieldId,
        );
        const subLevel = subPerm?.permissionLevel ?? modLevel;

        map.modules[mod.moduleCode].subModules[sub.subModuleCode] = {
          level: subLevel,
          pages: {},
        };

        for (const page of sub.pages || []) {
          const pagePerm = permissions.find(
            p => p.pageId === page.pageId && !p.fieldId,
          );
          const pageLevel = pagePerm?.permissionLevel ?? subLevel;

          const fieldMap: Record<string, PermissionLevel> = {};
          for (const field of page.fields || []) {
            const fieldPerm = permissions.find(p => p.fieldId === field.fieldId);
            fieldMap[field.fieldCode] = fieldPerm?.permissionLevel ?? pageLevel;
          }

          map.modules[mod.moduleCode].subModules[sub.subModuleCode].pages[page.pageCode] = {
            level: pageLevel,
            fields: fieldMap,
          };
        }
      }
    }


    return map;
  }

  // ─── Set Permissions for a User Group ─────────────────────────
  async setPermissions(tenantId: string, dto: SetPermissionsDto, createdBy: string): Promise<void> {
    // Delete existing permissions for this group
    await this.permissionRepo.delete({
      tenantId,
      userGroupId: dto.userGroupId,
    });

    // Insert new permissions
    const perms = dto.permissions.map(p => ({
      tenantId,
      userGroupId: dto.userGroupId,
      moduleId: p.moduleId || null,
      subModuleId: p.subModuleId || null,
      pageId: p.pageId || null,
      fieldId: p.fieldId || null,
      permissionLevel: p.permissionLevel,
      createdBy,
    }));

    await this.permissionRepo.save(perms);

    // Invalidate cache
    await this.invalidatePermissionCache(tenantId, dto.userGroupId);
  }

  // ─── Copy Permissions from one Group to Another ───────────────
  async copyPermissions(
    tenantId: string,
    sourceGroupId: string,
    targetGroupId: string,
    createdBy: string,
  ): Promise<void> {
    const sourcePerms = await this.permissionRepo.find({
      where: { tenantId, userGroupId: sourceGroupId },
    });

    await this.permissionRepo.delete({ tenantId, userGroupId: targetGroupId });

    const newPerms = sourcePerms.map(p => ({
      tenantId,
      userGroupId: targetGroupId,
      moduleId: p.moduleId,
      subModuleId: p.subModuleId,
      pageId: p.pageId,
      fieldId: p.fieldId,
      permissionLevel: p.permissionLevel,
      createdBy,
    }));

    await this.permissionRepo.save(newPerms);
    await this.invalidatePermissionCache(tenantId, targetGroupId);
  }

  // ─── Get All Modules with Sub-hierarchy ───────────────────────
  async getModuleHierarchy() {
    return this.moduleRepo.find({
      where: { isActive: true },
      relations: ['subModules', 'subModules.pages', 'subModules.pages.fields'],
      order: { sortOrder: 'ASC' },
    });
  }

  // ─── Get Permissions Grid for UI (permission matrix page) ─────
  async getPermissionsGrid(tenantId: string, userGroupId: string) {
    const group = await this.userGroupRepo.findOne({
      where: { userGroupId, tenantId },
    });
    if (!group) throw new NotFoundException('User group not found');

    const hierarchy = await this.getModuleHierarchy();
    const permissions = await this.permissionRepo.find({
      where: { tenantId, userGroupId },
    });

    const permMap = new Map(
      permissions.map(p => {
        const key = [p.moduleId, p.subModuleId, p.pageId, p.fieldId]
          .filter(Boolean).join(':');
        return [key, p.permissionLevel];
      }),
    );

    return {
      group,
      hierarchy,
      permMap: Object.fromEntries(permMap),
    };
  }

  // ─── Quick Check: Can User Access Module ──────────────────────
  async canAccessModule(tenantId: string, userGroupId: string, moduleCode: string): Promise<boolean> {
    const map = await this.getPermissionMap(tenantId, userGroupId);
    const modPerm = map.modules[moduleCode];
    return modPerm && modPerm.level !== PermissionLevel.NO_ACCESS && modPerm.level !== PermissionLevel.HIDDEN;
  }

  // ─── Invalidate Permission Cache ─────────────────────────────
  async invalidatePermissionCache(tenantId: string, userGroupId: string): Promise<void> {
    // Cache disabled
  }

  // ─── Invalidate All Tenant Caches (used when module structure changes) ───
  async invalidateTenantCache(tenantId: string): Promise<void> {
    const groups = await this.userGroupRepo.find({ where: { tenantId } });
    for (const group of groups) {
      await this.invalidatePermissionCache(tenantId, group.userGroupId);
    }
  }
}
