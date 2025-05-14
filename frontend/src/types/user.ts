export interface User {
    id: number;
    name: string;
    email: string;
    companyId: number | null;
    role: {
        id: number;
        name: string;
    };
}