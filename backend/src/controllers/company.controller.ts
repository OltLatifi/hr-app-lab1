import { Request, Response } from 'express';
import { findAllCompanies, createCompany, deleteCompany } from '../services/company.service';

export const getAllCompanies = async (req: Request, res: Response): Promise<Response> => {
    const systemAdminEmail = process.env.SYSTEM_ADMIN_EMAIL;
    if (!req.user || !req.user.email || req.user.email !== systemAdminEmail) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to view all companies.' });
    }

    try {
        const companies = await findAllCompanies();
        return res.status(200).json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        return res.status(500).json({ message: 'Internal server error fetching companies.' });
    }
};

export const createCompanyController = async (req: Request, res: Response): Promise<Response> => {
    const { name } = req.body;
    const adminUser = req.user;

    if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to create companies.' });
    }

    if (!name) {
        return res.status(400).json({ message: 'Company name is required.' });
    }

    try {
        const newCompany = await createCompany(name);
        return res.status(201).json(newCompany);
    } catch (error) {
        console.error('Error creating company:', error);
        if (error instanceof Error && error.message.includes('Database error')) {
             return res.status(500).json({ message: 'Database error during company creation.' });
        }
        return res.status(500).json({ message: 'Internal server error creating company.' });
    }
}; 

export const deleteCompanyController = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.params;
    const adminUser = req.user;

    if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to delete companies.' });
    }

    try {
        const deletedCompany = await deleteCompany(parseInt(companyId));
        return res.status(200).json(deletedCompany);
    } catch (error) {
        console.error('Error deleting company:', error);
        return res.status(500).json({ message: 'Internal server error deleting company.' });
    }
};
