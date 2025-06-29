
import React from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EditUserHeaderProps {
  userName: string;
}

const EditUserHeader = ({ userName }: EditUserHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle>Editar Usuário - {userName}</DialogTitle>
    </DialogHeader>
  );
};

export default EditUserHeader;
