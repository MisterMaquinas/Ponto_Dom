
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from 'lucide-react';
import type { User } from './types';

interface UserListProps {
  users: User[];
  userData: any;
  onDeleteUser: (id: string) => void;
  getRoleLabel: (role: string) => string;
  getRoleBadgeVariant: (role: string) => string;
}

const UserList = ({ users, userData, onDeleteUser, getRoleLabel, getRoleBadgeVariant }: UserListProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Usuários da {userData.companyName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum usuário cadastrado ainda.
            </p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center relative">
                    <span className="text-white font-medium text-sm">
                      {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                    {user.face_data && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Eye className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    <p className="text-xs text-gray-500">CPF: {user.cpf} • {user.contact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  {user.face_data && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Bio
                    </Badge>
                  )}
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;
