import { Request, Response } from 'express';
import * as employeeService from '../services/employee.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const body = req.body;
    body.companyId = companyId;

    try {
        const employee = await employeeService.createEmployee(body);
        return res.status(201).json(employee);
    } catch (error) {
        console.error('Error creating employee:', error);
        return res.status(500).json({ message: 'Failed to create employee' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const employees = await employeeService.getAllEmployees(companyId);
        return res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).json({ message: 'Failed to fetch employees' });
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
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await employeeService.findEmployeeById(id, companyId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        return res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        return res.status(500).json({ message: 'Failed to fetch employee' });
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
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await employeeService.updateEmployee(id, companyId, req.body);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        return res.status(200).json(employee);
    } catch (error) {
        console.error('Error updating employee:', error);
        return res.status(500).json({ message: 'Failed to update employee' });
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
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await employeeService.deleteEmployee(id, companyId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        return res.status(200).json({ message: 'Employee deleted successfully', employee });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({ message: 'Failed to delete employee' });
    }
}; 