import { Request, Response } from 'express';
import * as employeeService from '../services/employee.service';
import { sendEmail } from '../utils/email.utils';
import * as companyService from '../services/company.service';
import { createInvitation } from '../services/invitation.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;
    const currentUserId = req.user?.id;

    if(!companyId || !currentUserId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const body = req.body;
    body.companyId = companyId;

    const allowedToAdd = await employeeService.allowedToAddEmployee(companyId, 1);

    if(!allowedToAdd){
        return res.status(400).json({ message: 'You are not allowed to add more employees, subscribe to a plan to add more employees' });
    }

    try {
        const employeeExists = await employeeService.findEmployeeByEmail(body.email);
        if(employeeExists){
            return res.status(400).json({ message: 'Employee already exists' });
        }
        const employee = await employeeService.createEmployee(body);
        const company = await companyService.findCompanyById(companyId);
        const invitation = await createInvitation(employee.email, companyId, currentUserId, 'Employee');
        try {
            const email = employee.email;
            const companyName = company?.name;
            sendEmail(
                email,
                "HR Management System - Employee Invitation",
                `<p>You have been invited to join ${companyName} as an employee. Please click the link below to register:</p><p><a href="http://localhost:5173/register?token=${invitation.invitationToken}">Register</a></p>`
            );
    
        } catch (error) {
            console.error('Error creating employee:', error);
            return res.status(500).json({ message: 'Failed to create employee' });
        }
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

    const { departmentId, managerId, statusId, searchTerm } = req.query;

    const filters = {
        departmentId: departmentId as string | undefined,
        managerId: managerId as string | undefined,
        statusId: statusId as string | undefined,
        searchTerm: searchTerm as string | undefined,
    };

    try {
        const employees = await employeeService.getAllEmployees(companyId, filters);
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