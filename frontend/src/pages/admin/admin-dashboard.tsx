import { useQuery } from '@tanstack/react-query';
import { getCompanyStats, getEmployeeStats, getTrainingStats, getLeaveStats } from '@/services/statistics.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


const AdminDashboard = () => {
    const { data: companyStats, isLoading: isLoadingCompany } = useQuery({
        queryKey: ['companyStats'],
        queryFn: getCompanyStats
    });

    const { data: employeeStats, isLoading: isLoadingEmployee } = useQuery({
        queryKey: ['employeeStats'],
        queryFn: getEmployeeStats
    });

    const { data: trainingStats, isLoading: isLoadingTraining } = useQuery({
        queryKey: ['trainingStats'],
        queryFn: getTrainingStats
    });

    const { data: leaveStats, isLoading: isLoadingLeave } = useQuery({
        queryKey: ['leaveStats'],
        queryFn: getLeaveStats
    });

    const isLoading = isLoadingCompany || isLoadingEmployee || isLoadingTraining || isLoadingLeave;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Companies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{companyStats?.totalCompanies}</div>
                        <div className="text-sm text-muted-foreground">
                            {companyStats?.activeCompanies} active
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employeeStats?.totalEmployees}</div>
                        <div className="text-sm text-muted-foreground">
                            Across {employeeStats?.employeesByCompany.length} companies
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Training Programs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{trainingStats?.totalPrograms}</div>
                        <div className="text-sm text-muted-foreground">
                            {trainingStats?.activePrograms} active
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Leave Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leaveStats?.totalRequests}</div>
                        <div className="text-sm text-muted-foreground">
                            {leaveStats?.byStatus.pending} pending
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={employeeStats?.growthByMonth.map(item => ({
                                    month: MONTHS[item.month - 1],
                                    count: item.count
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Training Completion Rates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trainingStats?.completionRates}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="programName" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="completionRate" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Requests by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leaveStats?.byType}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span>Active</span>
                                <span className="font-bold">{companyStats?.subscriptionStats.active}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Expired</span>
                                <span className="font-bold">{companyStats?.subscriptionStats.expired}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Cancelled</span>
                                <span className="font-bold">{companyStats?.subscriptionStats.cancelled}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard; 