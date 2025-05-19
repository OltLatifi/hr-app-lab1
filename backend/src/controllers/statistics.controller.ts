import { Request, Response } from 'express';
import { getCompanyStatistics, getEmployeeStatistics, getTrainingStatistics, getLeaveStatistics } from '../services/statistics.service';

export const getCompanyStats = async (req: Request, res: Response) => {
    try {
        const stats = await getCompanyStatistics();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch company statistics' });
    }
};

export const getEmployeeStats = async (req: Request, res: Response) => {
    try {
        const stats = await getEmployeeStatistics();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee statistics' });
    }
};

export const getTrainingStats = async (req: Request, res: Response) => {
    try {
        const stats = await getTrainingStatistics();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch training statistics' });
    }
};

export const getLeaveStats = async (req: Request, res: Response) => {
    try {
        const stats = await getLeaveStatistics();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leave statistics' });
    }
}; 