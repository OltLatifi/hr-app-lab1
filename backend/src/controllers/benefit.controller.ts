import { Request, Response } from 'express';
import * as benefitService from '../services/benefit.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const companyId = req.user?.companyId;
    
    
    if(companyId){
        body.companyId = companyId;
    }

    try {
        const benefit = await benefitService.createBenefit(body);
        return res.status(201).json(benefit);
    } catch (error) {
        console.error('Error creating benefit:', error);
        return res.status(500).json({ message: 'Failed to create benefit' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const benefits = await benefitService.getAllBenefits(companyId);
        return res.status(200).json(benefits);
    } catch (error) {
        console.error('Error fetching benefits:', error);
        return res.status(500).json({ message: 'Failed to fetch benefits' });
    }
};

export const findOne = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid benefit ID' });
        }
        const benefit = await benefitService.findBenefitById(id, companyId);
        if (!benefit) {
            return res.status(404).json({ message: 'Benefit not found' });
        }
        return res.status(200).json(benefit);
    } catch (error) {
        console.error('Error fetching benefit:', error);
        return res.status(500).json({ message: 'Failed to fetch benefit' });
    }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid benefit ID' });
        }
        const benefit = await benefitService.updateBenefit(id, companyId, req.body);
        if (!benefit) {
            return res.status(404).json({ message: 'Benefit not found' });
        }
        return res.status(200).json(benefit);
    } catch (error) {
        console.error('Error updating benefit:', error);
        return res.status(500).json({ message: 'Failed to update benefit' });
    }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid benefit ID' });
        }
        const benefit = await benefitService.deleteBenefit(id, companyId);
        if (!benefit) {
            return res.status(404).json({ message: 'Benefit not found' });
        }
        return res.status(200).json({ message: 'Benefit deleted successfully', benefit });
    } catch (error) {
        console.error('Error deleting benefit:', error);
        return res.status(500).json({ message: 'Failed to delete benefit' });
    }
};

export const getEmployeeBenefits = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;
    const employeeId = parseInt(req.params.employeeId, 10);

    if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (isNaN(employeeId)) {
        return res.status(400).json({ message: 'Invalid employee ID' });
    }

    try {
        const benefits = await benefitService.getEmployeeBenefits(employeeId, companyId);
        return res.status(200).json(benefits);
    } catch (error) {
        console.error('Error fetching employee benefits:', error);
        return res.status(500).json({ message: 'Failed to fetch employee benefits' });
    }
};

export const assignBenefit = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { employeeId, benefitId, enrollmentDate } = req.body;

        if (!employeeId || !benefitId || !enrollmentDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const benefit = await benefitService.assignBenefit({
            employeeId,
            benefitId,
            enrollmentDate: new Date(enrollmentDate).toISOString(),
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return res.status(201).json(benefit);
    } catch (error) {
        console.error('Error assigning benefit:', error);
        return res.status(500).json({ message: 'Failed to assign benefit' });
    }
};

export const removeBenefit = async (req: Request, res: Response) => {
    try {
        const { employeeId, benefitId } = req.body;
        const companyId = req.user?.companyId;

        if (!companyId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!employeeId || !benefitId) {
            return res.status(400).json({ message: 'Employee ID and Benefit ID are required' });
        }

        await benefitService.removeBenefit(employeeId, benefitId, companyId);
        res.status(200).json({ message: 'Benefit removed successfully' });
    } catch (error) {
        console.error('Error removing benefit:', error);
        res.status(500).json({ message: 'Error removing benefit' });
    }
}; 