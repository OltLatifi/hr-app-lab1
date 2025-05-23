import { Request, Response } from 'express';
import * as jobTitleService from '../services/jobtitle.service';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const body = req.body;
    body.companyId = companyId;

    try {
        const jobTitle = await jobTitleService.createJobTitle(body);
        return res.status(201).json(jobTitle);
    } catch (error) {
        console.error('Error creating job title:', error);
        return res.status(500).json({ message: 'Failed to create job title' });
    }
};

export const findAll = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user?.companyId;

    if(!companyId){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const jobTitles = await jobTitleService.getAllJobTitles(companyId);
        return res.status(200).json(jobTitles);
    } catch (error) {
        console.error('Error fetching job titles:', error);
        return res.status(500).json({ message: 'Failed to fetch job titles' });
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
            return res.status(400).json({ message: 'Invalid job title ID' });
        }
        const jobTitle = await jobTitleService.findJobTitleById(id, companyId);
        if (!jobTitle) {
            return res.status(404).json({ message: 'Job title not found' });
        }
        return res.status(200).json(jobTitle);
    } catch (error) {
        console.error('Error fetching job title:', error);
        return res.status(500).json({ message: 'Failed to fetch job title' });
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
            return res.status(400).json({ message: 'Invalid job title ID' });
        }
        const jobTitle = await jobTitleService.updateJobTitle(id, companyId, req.body);
        if (!jobTitle) {
            return res.status(404).json({ message: 'Job title not found' });
        }
        return res.status(200).json(jobTitle);
    } catch (error) {
        console.error('Error updating job title:', error);
        return res.status(500).json({ message: 'Failed to update job title' });
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
            return res.status(400).json({ message: 'Invalid job title ID' });
        }
        const jobTitle = await jobTitleService.deleteJobTitle(id, companyId);
        if (!jobTitle) {
            return res.status(404).json({ message: 'Job title not found' });
        }
        return res.status(200).json({ message: 'Job title deleted successfully', jobTitle });
    } catch (error) {
        console.error('Error deleting job title:', error);
        return res.status(500).json({ message: 'Failed to delete job title' });
    }
}; 