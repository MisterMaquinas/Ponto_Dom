
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from 'lucide-react';

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  createdBy: string;
  companyId: number;
}

interface UserListProps {
  users: User[];
  userData: any;
  onDeleteUser: (id: number) => void;
  getRoleLabel: (role: string) => string;
  getRoleBadgeVariant: (role: string) => string;
}

const UserList = ({ users, userData, onDeleteUser, getRoleLabel, getRoleBadgeVariant }: UserListProps) => {
  const companyUsers = users.filter(user => user.companyId === userData.companyId);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Usuários da {userData.companyName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companyUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={getRoleBadgeVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDeleteUser(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;
