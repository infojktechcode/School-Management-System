import {
  PERMISSIONS,
  PERMISSION_GROUPS,
  ROLE_PERMISSIONS,
  USER_ROLES,
} from '@school-mgmt/shared';
import type { ExtendedPrismaClient } from '../../src/config/prisma.js';

function humanizePermission(code: string): string {
  const [resource, action] = code.split(':');
  const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  return `${capitalize(resource ?? code)} ${capitalize(action ?? '')}`.trim();
}

function groupForPermission(code: string): string {
  const entry = Object.entries(PERMISSION_GROUPS).find(([, permissions]) =>
    (permissions as string[]).includes(code),
  );
  return entry?.[0] ?? 'general';
}

export async function seedRolesAndPermissions(db: ExtendedPrismaClient): Promise<void> {
  for (const [name, meta] of Object.entries(USER_ROLES)) {
    await db.role.upsert({
      where: { name: name as keyof typeof USER_ROLES },
      update: { description: meta.description, isSystem: true },
      create: {
        name: name as keyof typeof USER_ROLES,
        description: meta.description,
        isSystem: true,
      },
    });
  }

  for (const code of Object.values(PERMISSIONS)) {
    await db.permission.upsert({
      where: { code },
      update: { name: humanizePermission(code), group: groupForPermission(code) },
      create: {
        code,
        name: humanizePermission(code),
        group: groupForPermission(code),
      },
    });
  }

  const roles = await db.role.findMany();
  const permissions = await db.permission.findMany();
  const roleByName = new Map(roles.map((role) => [role.name, role]));
  const permissionByCode = new Map(permissions.map((permission) => [permission.code, permission]));

  for (const [roleName, codes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roleByName.get(roleName as keyof typeof USER_ROLES);
    if (!role) continue;

    for (const code of codes) {
      const permission = permissionByCode.get(code);
      if (!permission) continue;

      await db.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  console.log(
    `  roles: ${roles.length}, permissions: ${permissions.length}, matrix entries: ${Object.values(ROLE_PERMISSIONS).flat().length}`,
  );
}
