import { Request, Response } from 'express';
import * as payrollService from '../services/payroll.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const companyId = req.user?.companyId;
    
    
    if(companyId){
        body.companyId = companyId;
    }

    try {
        const payroll = await payrollService.createPayroll(body);
        return res.status(201).json(payroll);
    } catch (error) {
        console.error('Error creating payroll:', error);
        return res.status(500).json({ message: 'Failed to create payroll' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const payrolls = await payrollService.getAllPayrolls(companyId);
        const formattedPayrolls = payrolls.map(payroll => ({
            ...payroll,
            netPay: payroll.netPay / 100,
            grossPay: payroll.grossPay / 100
        }));
        return res.status(200).json(formattedPayrolls);
    } catch (error) {
        console.error('Error fetching payrolls:', error);
        return res.status(500).json({ message: 'Failed to fetch payrolls' });
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
            return res.status(400).json({ message: 'Invalid payroll ID' });
        }
        const payroll = await payrollService.findPayrollById(id, companyId);
        if (!payroll) {
            return res.status(404).json({ message: 'Payroll not found' });
        }

        const formattedPayroll = {
            ...payroll,
            netPay: payroll.netPay / 100,
            grossPay: payroll.grossPay / 100
        };
        return res.status(200).json(formattedPayroll);
    } catch (error) {
        console.error('Error fetching payroll:', error);
        return res.status(500).json({ message: 'Failed to fetch payroll' });
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
            return res.status(400).json({ message: 'Invalid payroll ID' });
        }
        const payroll = await payrollService.updatePayroll(id, companyId, req.body);
        if (!payroll) {
            return res.status(404).json({ message: 'Payroll not found' });
        }
        const formattedPayroll = {
            ...payroll,
            netPay: payroll.netPay / 100,
            grossPay: payroll.grossPay / 100
        };
        return res.status(200).json(formattedPayroll);
    } catch (error) {
        console.error('Error updating payroll:', error);
        return res.status(500).json({ message: 'Failed to update payroll' });
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
            return res.status(400).json({ message: 'Invalid training ID' });
        }
        const payroll = await payrollService.deletePayroll(id, companyId);
        if (!payroll) {
            return res.status(404).json({ message: 'Payroll not found' });
        }
        return res.status(200).json({ message: 'Payroll deleted successfully', payroll });
    } catch (error) {
        console.error('Error deleting training:', error);
        return res.status(500).json({ message: 'Failed to delete training' });
    }
};

export const calculateByMonth = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const payrolls = await payrollService.calculatePayrollsByMonth(companyId);
        return res.status(200).json(payrolls);
    } catch (error) {
        console.error('Error calculating payrolls by month:', error);
        return res.status(500).json({ message: 'Failed to calculate payrolls by month' });
    }
};


export const calculateByDepartment = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const payrolls = await payrollService.calculatePayrollsByDepartment(companyId);
        return res.status(200).json(payrolls);
    } catch (error) {
        console.error('Error calculating payrolls by department:', error);
        return res.status(500).json({ message: 'Failed to calculate payrolls by department' });
    }
};