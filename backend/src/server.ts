import http from 'http';
import express from 'express';
import './config/logging';
import cookieParser from 'cookie-parser';

import { corsHandler } from './middleware/corsHandler';
import { loggingHandler } from './middleware/loggingHandler';
import { routeNotFound } from './middleware/routeNotFound';
import { server } from './config/config';
import authRouter from './routes/auth.routes';
import departmentRouter from './routes/department.routes';
import jobTitleRouter from './routes/jobtitle.route';

export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = () => {
    application.use(express.urlencoded({ extended: true }));
    application.use(express.json());
    application.use(cookieParser());
    application.use(loggingHandler);
    application.use(corsHandler);

    application.get('/main/healthcheck', (req, res, next) => {
        return res.status(200).json({ hello: 'world!' });
    });
    
    application.use('/auth', authRouter);
    application.use('/departments', departmentRouter);
    application.use('/jobtitles', jobTitleRouter);
    application.use(routeNotFound);

    httpServer = http.createServer(application);
    httpServer.listen(server.SERVER_PORT, () => {
        logging.log('----------------------------------------');
        logging.log(`Server started on ${server.SERVER_HOSTNAME}:${server.SERVER_PORT}`);
        logging.log('----------------------------------------');
    });
};

export const Shutdown = (callback: any) => httpServer && httpServer.close(callback);

Main();
