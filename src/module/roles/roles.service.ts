import { Injectable, BadRequestException } from '@nestjs/common';
import { db } from '../../db';
import { rolesTable } from '../../db/schema/roles.schema';
import { permissionsTable } from '../../db/schema/permissions.schema';
import { rolePermissionsTable } from '../../db/schema/role-permissions.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { eq, inArray } from 'drizzle-orm';

@Injectable()
export class RolesService {
  async getAllRoles() {
    const roles = await db.query.rolesTable.findMany({
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
      orderBy: (roles, { desc }) => [desc(roles.createdAt)],
    });

    return roles.map(role => ({
      id: role.id,
      name: role.name,
      permissions: role.rolePermissions.map(rp => rp.permission.name),
    }));
  }

  async createRole(dto: CreateRoleDto) {
    // Ensure role name is unique
    const existingRole = await db.query.rolesTable.findFirst({
      where: eq(rolesTable.name, dto.name),
    });
    if (existingRole) {
      throw new BadRequestException('Role with this name already exists');
    }

    const newRole = await db.insert(rolesTable).values({
      name: dto.name,
    }).returning();

    const roleId = newRole[0].id;

    if (dto.permissions && dto.permissions.length > 0) {
      for (const pName of dto.permissions) {
        // Find or create permission
        let perm = await db.query.permissionsTable.findFirst({
          where: eq(permissionsTable.name, pName),
        });

        if (!perm) {
          const insertedPerm = await db.insert(permissionsTable).values({
            name: pName,
          }).returning();
          perm = insertedPerm[0];
        }

        // Link permission to role
        await db.insert(rolePermissionsTable).values({
          roleId: roleId,
          permissionId: perm.id,
        });
      }
    }

    return {
      id: roleId,
      name: dto.name,
      permissions: dto.permissions || [],
    };
  }

  async getPermissionsList() {
    const perms = await db.query.permissionsTable.findMany();
    return perms.map(p => p.name);
  }
}
