
export const canCreateRole = (userType: 'admin' | 'manager' | 'supervisor', role: string) => {
  if (userType === 'admin') return true;
  if (userType === 'manager') return ['supervisor', 'user'].includes(role);
  if (userType === 'supervisor') return role === 'user';
  return false;
};

export const getAvailableRoles = (userType: 'admin' | 'manager' | 'supervisor') => {
  if (userType === 'admin') return [
    { value: 'manager', label: 'Gerente' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'user', label: 'Funcionário' }
  ];
  if (userType === 'manager') return [
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'user', label: 'Funcionário' }
  ];
  return [{ value: 'user', label: 'Funcionário' }];
};

export const getRoleLabel = (role: string) => {
  const roleMap = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'supervisor': 'Supervisor',
    'user': 'Funcionário'
  };
  return roleMap[role as keyof typeof roleMap] || role;
};

export const getRoleBadgeVariant = (role: string) => {
  const variantMap = {
    'admin': 'bg-purple-100 text-purple-800',
    'manager': 'bg-blue-100 text-blue-800',
    'supervisor': 'bg-orange-100 text-orange-800',
    'user': 'bg-green-100 text-green-800'
  };
  return variantMap[role as keyof typeof variantMap] || 'bg-gray-100 text-gray-800';
};
