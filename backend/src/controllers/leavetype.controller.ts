import { Request, Response } from 'express';
import * as leaveTypeService from '../services/leavetype.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const companyId = req.user?.companyId;
    
    
    if(companyId){
        body.companyId = companyId;
    }

    try {
        const leaveType = await leaveTypeService.createLeaveType(body);
        return res.status(201).json(leaveType);
    } catch (error) {
        console.error('Error creating leave type:', error);
        return res.status(500).json({ message: 'Failed to create leave type' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const leaveTypes = await leaveTypeService.getAllLeaveTypes(companyId);
        return res.status(200).json(leaveTypes);
    } catch (error) {
        console.error('Error fetching leave types:', error);
        return res.status(500).json({ message: 'Failed to fetch leave types' });
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
            return res.status(400).json({ message: 'Invalid leave type ID' });
        }
        const leaveType = await leaveTypeService.findLeaveTypeById(id, companyId);
        if (!leaveType) {
            return res.status(404).json({ message: 'Leave type not found' });
        }
        return res.status(200).json(leaveType);
    } catch (error) {
        console.error('Error fetching leave type:', error);
        return res.status(500).json({ message: 'Failed to fetch leave type' });
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
            return res.status(400).json({ message: 'Invalid leave type ID' });
        }
        const leaveType = await leaveTypeService.updateLeaveType(id, companyId, req.body);
        if (!leaveType) {
            return res.status(404).json({ message: 'Leave type not found' });
        }
        return res.status(200).json(leaveType);
    } catch (error) {
        console.error('Error updating leave type:', error);
        return res.status(500).json({ message: 'Failed to update leave type' });
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
            return res.status(400).json({ message: 'Invalid leave type ID' });
        }
        const leaveType = await leaveTypeService.deleteLeaveType(id, companyId);
        if (!leaveType) {
            return res.status(404).json({ message: 'Leave type not found' });
        }
        return res.status(200).json({ message: 'Leave type deleted successfully', leaveType });
    } catch (error) {
        console.error('Error deleting leave type:', error);
        return res.status(500).json({ message: 'Failed to delete leave type' });
    }
}; 