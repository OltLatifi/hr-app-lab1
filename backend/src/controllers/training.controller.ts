import { Request, Response } from 'express';
import * as trainingService from '../services/training.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const companyId = req.user?.companyId;
    
    if(companyId){
        body.companyId = companyId;
    }

    try {
        const training = await trainingService.createTraining(body);
        return res.status(201).json(training);
    } catch (error) {
        console.error('Error creating training:', error);
        return res.status(500).json({ message: 'Failed to create training' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const trainings = await trainingService.getAllTrainings(companyId);
        return res.status(200).json(trainings);
    } catch (error) {
        console.error('Error fetching trainings:', error);
        return res.status(500).json({ message: 'Failed to fetch trainings' });
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
            return res.status(400).json({ message: 'Invalid training ID' });
        }
        const training = await trainingService.findTrainingById(id, companyId);
        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }
        return res.status(200).json(training);
    } catch (error) {
        console.error('Error fetching training:', error);
        return res.status(500).json({ message: 'Failed to fetch training' });
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
            return res.status(400).json({ message: 'Invalid training ID' });
        }
        const training = await trainingService.updateTraining(id, companyId, req.body);
        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }
        return res.status(200).json(training);
    } catch (error) {
        console.error('Error updating training:', error);
        return res.status(500).json({ message: 'Failed to update training' });
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
        const training = await trainingService.deleteTraining(id, companyId);
        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }
        return res.status(200).json({ message: 'Training deleted successfully', training });
    } catch (error) {
        console.error('Error deleting training:', error);
        return res.status(500).json({ message: 'Failed to delete training' });
    }
};

export const getEmployeeTrainings = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;
    const employeeId = parseInt(req.params.employeeId, 10);

    if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (isNaN(employeeId)) {
        return res.status(400).json({ message: 'Invalid employee ID' });
    }

    try {
        const trainings = await trainingService.getEmployeeTrainings(employeeId, companyId);
        return res.status(200).json(trainings);
    } catch (error) {
        console.error('Error fetching employee trainings:', error);
        return res.status(500).json({ message: 'Failed to fetch employee trainings' });
    }
};

export const assignTraining = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { employeeId, trainingId, completionDate } = req.body;

        if (!employeeId || !trainingId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const training = await trainingService.assignTraining({
            employeeId,
            programId: trainingId,
            completionDate: completionDate ? new Date(completionDate).toISOString() : null,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return res.status(201).json(training);
    } catch (error) {
        console.error('Error assigning training:', error);
        return res.status(500).json({ message: 'Failed to assign training' });
    }
};

export const removeTraining = async (req: Request, res: Response) => {
    try {
        const { employeeId, trainingId } = req.body;
        const companyId = req.user?.companyId;

        if (!companyId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!employeeId || !trainingId) {
            return res.status(400).json({ message: 'Employee ID and Training ID are required' });
        }

        await trainingService.removeTraining(employeeId, trainingId);
        res.status(200).json({ message: 'Training removed successfully' });
    } catch (error) {
        console.error('Error removing training:', error);
        res.status(500).json({ message: 'Error removing training' });
    }
}; 