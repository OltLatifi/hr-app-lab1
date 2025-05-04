import { Request, Response } from 'express';
import * as employmentStatusService from '../services/employmentstatus.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const body = req.body;
    body.companyId = companyId;

    try {
        const employmentStatus = await employmentStatusService.createEmploymentStatus(req.body);
        return res.status(201).json(employmentStatus);
    } catch (error) {
        console.error('Error creating employment status:', error);
        return res.status(500).json({ message: 'Failed to create employment status' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const employmentStatuses = await employmentStatusService.getAllEmploymentStatuses(companyId);
        return res.status(200).json(employmentStatuses);
    } catch (error) {
        console.error('Error fetching employment statuses:', error);
        return res.status(500).json({ message: 'Failed to fetch employment statuses' });
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
            return res.status(400).json({ message: 'Invalid employment status ID' });
        }
        const employmentStatus = await employmentStatusService.findEmploymentStatusById(id, companyId);
        if (!employmentStatus) {
            return res.status(404).json({ message: 'Employment status not found' });
        }
        return res.status(200).json(employmentStatus);
    } catch (error) {
        console.error('Error fetching employment status:', error);
        return res.status(500).json({ message: 'Failed to fetch employment status' });
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
            return res.status(400).json({ message: 'Invalid employment status ID' });
        }
        const employmentStatus = await employmentStatusService.updateEmploymentStatus(id, companyId, req.body);
        if (!employmentStatus) {
            return res.status(404).json({ message: 'Employment status not found' });
        }
        return res.status(200).json(employmentStatus);
    } catch (error) {
        console.error('Error updating employment status:', error);
        return res.status(500).json({ message: 'Failed to update employment status' });
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
            return res.status(400).json({ message: 'Invalid employment status ID' });
        }
        const employmentStatus = await employmentStatusService.deleteEmploymentStatus(id, companyId);
        if (!employmentStatus) {
            return res.status(404).json({ message: 'Employment status not found' });
        }
        return res.status(200).json({ message: 'Employment status deleted successfully', employmentStatus });
    } catch (error) {
        console.error('Error deleting employment status:', error);
        return res.status(500).json({ message: 'Failed to delete employment status' });
    }
}; 