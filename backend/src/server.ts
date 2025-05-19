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
import employmentStatusRouter from './routes/employmentstatus.route';
import employeeRouter from './routes/employee.route';
import adminRoutes from './routes/admin.routes';
import companyRoutes from './routes/company.routes';
import trainingRouter from './routes/training.route';
import benefitRouter from './routes/benefit.route';
import leaveTypeRouter from './routes/leavetype.route';
import payrollRouter from './routes/payroll.route';
import payLimitRouter from './routes/paylimit.route';
import leaveRouter from './routes/leave.route';
import subscriptionRouter from './routes/subscription.routes';
import webhookRoutes from './routes/webhook.routes';
import statisticsRouter from './routes/statistics.routes';

export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = () => {
    // Stripe needs to be before middlewares
    application.use('/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes);

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
    application.use('/employmentstatuses', employmentStatusRouter);
    application.use('/employees', employeeRouter);
    application.use('/admin', adminRoutes);
    application.use('/companies', companyRoutes);
    application.use('/trainings', trainingRouter);
    application.use('/payrolls', payrollRouter);
    application.use('/benefits', benefitRouter);
    application.use('/leavetypes', leaveTypeRouter);
    application.use('/paylimits', payLimitRouter);
    application.use('/leaverequests', leaveRouter);
    application.use('/subscriptions', subscriptionRouter);
    application.use('/statistics', statisticsRouter);
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
