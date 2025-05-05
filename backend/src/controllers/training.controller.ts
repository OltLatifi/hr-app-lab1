import { Request, Response } from 'express';
import * as trainingService from '../services/training.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const companyId = req.user?.companyId;
    
    
    if(companyId){
        body.companyId = companyId;
    }

    try {
        const training = await trainingService.createTrainingProgram(body);
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
        const trainings = await trainingService.getAllTrainingPrograms(companyId);
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
        const training = await trainingService.findTrainingProgramById(id, companyId);
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
        const training = await trainingService.updateTrainingProgram(id, companyId, req.body);
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
        const training = await trainingService.deleteTrainingProgram(id, companyId);
        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }
        return res.status(200).json({ message: 'Training deleted successfully', training });
    } catch (error) {
        console.error('Error deleting training:', error);
        return res.status(500).json({ message: 'Failed to delete training' });
    }
}; 