import { Request, Response } from 'express';
import * as payLimitService from '../services/paylimit.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const companyId = req.user?.companyId;
    
    
    if(companyId){
        body.companyId = companyId;
    }

    try {
        const payLimit = await payLimitService.createPayLimit(body);
        return res.status(201).json(payLimit);
    } catch (error) {
        console.error('Error creating pay limit:', error);
        return res.status(500).json({ message: 'Failed to create pay limit' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const payLimits = await payLimitService.getAllPayLimits(companyId);
        return res.status(200).json(payLimits);
    } catch (error) {
        console.error('Error fetching pay limits:', error);
        return res.status(500).json({ message: 'Failed to fetch pay limits' });
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
            return res.status(400).json({ message: 'Invalid pay limit ID' });
        }
        const payLimit = await payLimitService.findPayLimitById(id);
        if (!payLimit) {
            return res.status(404).json({ message: 'Pay limit not found' });
        }
        return res.status(200).json(payLimit);
    } catch (error) {
        console.error('Error fetching pay limit:', error);
        return res.status(500).json({ message: 'Failed to fetch pay limit' });
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
            return res.status(400).json({ message: 'Invalid pay limit ID' });
        }
        const payLimit = await payLimitService.updatePayLimit(id, req.body);
        if (!payLimit) {
            return res.status(404).json({ message: 'Pay limit not found' });
        }
        return res.status(200).json(payLimit);
    } catch (error) {
        console.error('Error updating pay limit:', error);
        return res.status(500).json({ message: 'Failed to update pay limit' });
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
            return res.status(400).json({ message: 'Invalid pay limit ID' });
        }
        const payLimit = await payLimitService.deletePayLimit(id);
        if (!payLimit) {
            return res.status(404).json({ message: 'Pay limit not found' });
        }
        return res.status(200).json({ message: 'Pay limit deleted successfully', payLimit });
    } catch (error) {
        console.error('Error deleting pay limit:', error);
        return res.status(500).json({ message: 'Failed to delete pay limit' });
    }
}; 