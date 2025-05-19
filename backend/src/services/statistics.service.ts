import db from '../db';
import { company, users, departments, employees, trainingPrograms, leaveRequests, employeeTraining } from '../db/schema';
import { eq, and, gte, lte, sql, count, desc } from 'drizzle-orm';
import { subMonths } from 'date-fns';

type Company = typeof company.$inferSelect;
type Employee = typeof employees.$inferSelect;
type TrainingProgram = typeof trainingPrograms.$inferSelect;
type EmployeeTraining = typeof employeeTraining.$inferSelect;
type LeaveRequest = typeof leaveRequests.$inferSelect;

interface CompanyStats {
    totalCompanies: number;
    activeCompanies: number;
    companiesWithAdmin: number;
    companiesWithoutAdmin: number;
    subscriptionStats: {
        active: number;
        expired: number;
        cancelled: number;
        byPlan: Record<string, number>;
    };
}

interface EmployeeStats {
    totalEmployees: number;
    employeesByCompany: Array<{
        companyName: string;
        count: number;
    }>;
    growthByMonth: Array<{
        month: number;
        count: number;
    }>;
}

interface TrainingStats {
    totalPrograms: number;
    activePrograms: number;
    completionRates: Array<{
        programName: string;
        completionRate: number;
    }>;
}

interface LeaveStats {
    totalRequests: number;
    byStatus: {
        approved: number;
        pending: number;
        rejected: number;
    };
    byType: Array<{
        type: string;
        count: number;
    }>;
}

export const getCompanyStatistics = async (): Promise<CompanyStats> => {
    const companies = await db.query.company.findMany({
        with: {
            admin: true
        }
    });

    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.subscriptionStatus === 'ACTIVE').length;
    const companiesWithAdmin = companies.filter(c => c.admin !== null).length;
    const companiesWithoutAdmin = totalCompanies - companiesWithAdmin;

    const subscriptionStats = {
        active: 0,
        expired: 0,
        cancelled: 0,
        byPlan: {} as Record<string, number>
    };

    companies.forEach(c => {
        if (c.subscriptionStatus === 'ACTIVE') subscriptionStats.active++;
        if (c.subscriptionStatus === 'EXPIRED') subscriptionStats.expired++;
        if (c.subscriptionStatus === 'CANCELLED') subscriptionStats.cancelled++;
        
        if (c.currentPlanId) {
            subscriptionStats.byPlan[c.currentPlanId] = (subscriptionStats.byPlan[c.currentPlanId] || 0) + 1;
        }
    });

    return {
        totalCompanies,
        activeCompanies,
        companiesWithAdmin,
        companiesWithoutAdmin,
        subscriptionStats
    };
};

export const getEmployeeStatistics = async (): Promise<EmployeeStats> => {
    const sixMonthsAgo = subMonths(new Date(), 6);
    
    const [totalEmployees, employeesByCompany, monthlyGrowth] = await Promise.all([
        db.query.employees.findMany({
            columns: {
                id: true
            }
        }),
        db.query.employees.findMany({
            columns: {
                id: true
            },
            with: {
                company: {
                    columns: {
                        name: true
                    }
                }
            }
        }),
        db.query.employees.findMany({
            columns: {
                id: true,
                createdAt: true
            },
            where: gte(employees.createdAt, sixMonthsAgo)
        })
    ]);

    const employeesByCompanyMap = employeesByCompany.reduce((acc, emp) => {
        if (emp.company) {
            acc[emp.company.name] = (acc[emp.company.name] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const monthlyGrowthMap = monthlyGrowth.reduce((acc, emp) => {
        const month = emp.createdAt.getMonth();
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    return {
        totalEmployees: totalEmployees.length,
        employeesByCompany: Object.entries(employeesByCompanyMap).map(([name, count]) => ({
            companyName: name,
            count
        })),
        growthByMonth: Object.entries(monthlyGrowthMap).map(([month, count]) => ({
            month: parseInt(month),
            count
        }))
    };
};

export const getTrainingStatistics = async (): Promise<TrainingStats> => {
    const [programs, trainingData] = await Promise.all([
        db.query.trainingPrograms.findMany(),
        db.query.employeeTraining.findMany({
            with: {
                trainingProgram: {
                    columns: {
                        name: true
                    }
                }
            }
        })
    ]);

    const completionRates = programs.map(program => {
        const programTrainings = trainingData.filter(t => t.trainingProgram?.name === program.name);
        const completedCount = programTrainings.filter(t => t.completionDate !== null).length;
        const completionRate = programTrainings.length > 0 
            ? (completedCount / programTrainings.length) * 100 
            : 0;

        return {
            programName: program.name,
            completionRate
        };
    });

    return {
        totalPrograms: programs.length,
        activePrograms: programs.length,
        completionRates
    };
};

export const getLeaveStatistics = async (): Promise<LeaveStats> => {
    const leaveData = await db.query.leaveRequests.findMany({
        with: {
            leaveType: {
                columns: {
                    typeName: true
                }
            }
        }
    });

    const byStatus = {
        approved: 0,
        pending: 0,
        rejected: 0
    };

    const byTypeMap = leaveData.reduce((acc, leave) => {
        if (leave.leaveType) {
            acc[leave.leaveType.typeName] = (acc[leave.leaveType.typeName] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    leaveData.forEach(leave => {
        byStatus[leave.status.toLowerCase() as keyof typeof byStatus]++;
    });

    return {
        totalRequests: leaveData.length,
        byStatus,
        byType: Object.entries(byTypeMap).map(([type, count]) => ({
            type,
            count
        }))
    };
}; 