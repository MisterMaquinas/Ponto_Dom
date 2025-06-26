
import { UserRole, canCreateRole, getAvailableRolesForUser } from './hierarchyUtils';

export const canCreateRoleForUser = (userType: UserRole, role: string) => {
  return canCreateRole(userType, role as UserRole);
};

export const getAvailableRoles = (userType: UserRole) => {
  return getAvailableRolesForUser(userType);
};

export const getRoleLabel = (role: string) => {
  const roleMap = {
    'master': 'Master',
    'admin': 'Administrador',
    'manager': 'Gerente',
    'supervisor': 'Supervisor',
    'user': 'Funcionário'
  };
  return roleMap[role as keyof typeof roleMap] || role;
};

export const getRoleBadgeVariant = (role: string) => {
  const variantMap = {
    'master': 'bg-purple-100 text-purple-800',
    'admin': 'bg-blue-100 text-blue-800',
    'manager': 'bg-indigo-100 text-indigo-800',
    'supervisor': 'bg-orange-100 text-orange-800',
    'user': 'bg-green-100 text-green-800'
  };
  return variantMap[role as keyof typeof variantMap] || 'bg-gray-100 text-gray-800';
};
