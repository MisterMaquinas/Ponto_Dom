
// Hierarquia de permissões do sistema
export const ROLE_HIERARCHY = {
  master: 4,
  admin: 3,
  manager: 2,
  supervisor: 1,
  user: 0
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

export const canManageUser = (managerRole: UserRole, targetRole: UserRole): boolean => {
  const managerLevel = ROLE_HIERARCHY[managerRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  
  // Um usuário pode gerenciar apenas usuários de níveis inferiores
  return managerLevel > targetLevel;
};

export const canCreateRole = (creatorRole: UserRole, roleToCreate: UserRole): boolean => {
  return canManageUser(creatorRole, roleToCreate);
};

export const getManageableRoles = (userRole: UserRole): UserRole[] => {
  const userLevel = ROLE_HIERARCHY[userRole];
  
  return Object.entries(ROLE_HIERARCHY)
    .filter(([role, level]) => level < userLevel)
    .map(([role]) => role as UserRole);
};

export const getAvailableRolesForUser = (userRole: UserRole) => {
  const manageableRoles = getManageableRoles(userRole);
  
  const roleLabels = {
    admin: 'Administrador',
    manager: 'Gerente', 
    supervisor: 'Supervisor',
    user: 'Funcionário'
  };
  
  return manageableRoles
    .filter(role => role !== 'master') // Master não pode ser criado por outros usuários
    .map(role => ({
      value: role,
      label: roleLabels[role as keyof typeof roleLabels] || role
    }));
};

export const canViewUser = (viewerRole: UserRole, targetRole: UserRole): boolean => {
  // Master pode ver todos
  if (viewerRole === 'master') return true;
  
  // Usuários podem ver apenas a si mesmos (isso deve ser controlado por ID, não por role)
  if (viewerRole === 'user') return targetRole === 'user';
  
  // Outros podem ver usuários de níveis iguais ou inferiores
  const viewerLevel = ROLE_HIERARCHY[viewerRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  
  return viewerLevel >= targetLevel;
};

export const filterUsersByHierarchy = (users: any[], viewerRole: UserRole) => {
  return users.filter(user => canViewUser(viewerRole, user.role as UserRole));
};
