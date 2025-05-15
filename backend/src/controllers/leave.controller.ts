import { Request, Response } from 'express';
import * as leaveService from '../services/leave.service';
import * as employeeService from '../services/employee.service';
import * as companyService from '../services/company.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const userEmail = req.user?.email;
    if(!userEmail){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const company = await companyService.getCompanyByUserEmail(userEmail);

    if(!company){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    body.companyId = company.id;

    if(userEmail){
        const employee = await employeeService.findEmployeeByEmail(userEmail);
        if(employee){
            body.employeeId = employee.id;
        }
    }

    try {
        const leaveRequest = await leaveService.createLeaveRequest(body);
        return res.status(201).json(leaveRequest);
    } catch (error) {
        console.error('Error creating leave request:', error);
        return res.status(500).json({ message: 'Failed to create leave request' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    let companyId = req.user?.companyId;

    if(!companyId){
        const userEmail = req.user?.email;
        if(!userEmail){
            return res.status(401).json({ message: 'Unauthorized' });
        }
    
        const company = await companyService.getCompanyByUserEmail(userEmail);
    
        if(!company){
            return res.status(401).json({ message: 'Unauthorized' });
        }
    
        companyId = company.id;
    }

    try {
        const leaveRequests = await leaveService.getAllLeaveRequests(companyId);
        return res.status(200).json(leaveRequests);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        return res.status(500).json({ message: 'Failed to fetch leave requests' });
    }
};

export const findOne = async (req: Request, res: Response): Promise<Response> => {
    let companyId = req.user?.companyId;

    if(!companyId){
        const userEmail = req.user?.email;
        if(!userEmail){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const company = await companyService.getCompanyByUserEmail(userEmail);

        if(!company){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        companyId = company.id;
    }

    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid leave request ID' });
        }
        const leaveRequest = await leaveService.findLeaveRequestById(id, companyId);
        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        return res.status(200).json(leaveRequest);
    } catch (error) {
        console.error('Error fetching leave request:', error);
        return res.status(500).json({ message: 'Failed to fetch leave request' });
    }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    let companyId = req.user?.companyId;

    if(!companyId){
        const userEmail = req.user?.email;
        if(!userEmail){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const company = await companyService.getCompanyByUserEmail(userEmail);

        if(!company){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        companyId = company.id;
    }

    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid leave request ID' });
        }
        const leaveRequest = await leaveService.updateLeaveRequest(id, companyId, req.body);
        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        return res.status(200).json(leaveRequest);
    } catch (error) {
        console.error('Error updating leave request:', error);
        return res.status(500).json({ message: 'Failed to update leave request' });
    }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    let companyId = req.user?.companyId;

    if(!companyId){
        const userEmail = req.user?.email;
        if(!userEmail){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const company = await companyService.getCompanyByUserEmail(userEmail);

        if(!company){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        companyId = company.id;
    }

    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid leave request ID' });
        }
        const leaveRequest = await leaveService.deleteLeaveRequest(id, companyId);
        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        return res.status(200).json({ message: 'Leave request deleted successfully', leaveRequest });
    } catch (error) {
        console.error('Error deleting leave request:', error);
        return res.status(500).json({ message: 'Failed to delete leave request' });
    }
};