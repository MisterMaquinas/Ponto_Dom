
export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  created_by: string;
  company_id: string;
  cpf: string;
  rg: string;
  birth_date: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  face_data?: string;
}

export interface UserFormData {
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  username: string;
  password: string;
  role: string;
  face_data?: string;
}
