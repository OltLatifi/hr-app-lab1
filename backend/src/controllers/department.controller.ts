import { Request, Response } from 'express';
import * as departmentService from '../services/department.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const companyId = req.user?.companyId;
    
    
    if(companyId){
        body.companyId = companyId;
    }

    try {
        const department = await departmentService.createDepartment(body);
        return res.status(201).json(department);
    } catch (error) {
        console.error('Error creating department:', error);
        return res.status(500).json({ message: 'Failed to create department' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const departments = await departmentService.getAllDepartments(companyId);
        return res.status(200).json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        return res.status(500).json({ message: 'Failed to fetch departments' });
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
            return res.status(400).json({ message: 'Invalid department ID' });
        }
        const department = await departmentService.findDepartmentById(id, companyId);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        return res.status(200).json(department);
    } catch (error) {
        console.error('Error fetching department:', error);
        return res.status(500).json({ message: 'Failed to fetch department' });
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
            return res.status(400).json({ message: 'Invalid department ID' });
        }
        const department = await departmentService.updateDepartment(id, companyId, req.body);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        return res.status(200).json(department);
    } catch (error) {
        console.error('Error updating department:', error);
        return res.status(500).json({ message: 'Failed to update department' });
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
            return res.status(400).json({ message: 'Invalid department ID' });
        }
        const department = await departmentService.deleteDepartment(id, companyId);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        return res.status(200).json({ message: 'Department deleted successfully', department });
    } catch (error) {
        console.error('Error deleting department:', error);
        return res.status(500).json({ message: 'Failed to delete department' });
    }
}; 