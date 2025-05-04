import { User } from "./user";

export interface Company {
    id: number;
    name: string;
    adminId: number;
    createdAt: string;
    updatedAt: string;
}

export interface CompanyWithAdmin extends Company {
    admin: User;
}