import { Request, Response } from 'express';
import * as employeeService from '../services/employee.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    try {
        const employee = await employeeService.createEmployee(req.body);
        return res.status(201).json(employee);
    } catch (error) {
        console.error('Error creating employee:', error);
        return res.status(500).json({ message: 'Failed to create employee' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
        const employees = await employeeService.getAllEmployees();
        return res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).json({ message: 'Failed to fetch employees' });
    }
};

export const findOne = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await employeeService.findEmployeeById(id);
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
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await employeeService.updateEmployee(id, req.body);
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
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await employeeService.deleteEmployee(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        return res.status(200).json({ message: 'Employee deleted successfully', employee });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({ message: 'Failed to delete employee' });
    }
}; 