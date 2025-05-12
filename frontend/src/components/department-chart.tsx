import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getStatisticsByDepartment } from '@/services/payrollService';

interface DepartmentStats {
    departmentName: string;
    count: number;
}

const DepartmentChart = () => {
    const { data: payrollData = [], isLoading: payrollLoading } = useQuery<Record<number, number>>({
        queryKey: ['payrollsByDepartment'],
        queryFn: () => getStatisticsByDepartment(),
    });

    const getDepartmentStats = (payrollData: Record<string, number>): DepartmentStats[] => {
        const departmentMap = new Map<string, number>();
        
        Object.entries(payrollData).forEach(([department, amount]) => {
            const currentCount = departmentMap.get(department) || 0;
            departmentMap.set(department, currentCount + amount);
        });

        return Array.from(departmentMap.entries())
            .map(([departmentName, count]) => ({
                departmentName,
                count: count / 100
            }))
            .sort((a, b) => b.count - a.count);
    };

    if (payrollLoading) {
        return (
            <div className="bg-white rounded-xl shadow p-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Department Distribution</h2>
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    console.log(payrollData);
    const departmentStats = getDepartmentStats(payrollData);

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Department Distribution</h2>
                <p className="text-gray-500 text-sm">Spendings by department</p>
            </div>
            <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="departmentName"
                            stroke="#94a3b8"
                            fontSize={14}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={14}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: 8, borderColor: '#2563eb' }}
                            formatter={(value: number) => [`${value} €`, 'Count']}
                        />
                        <Bar
                            dataKey="count"
                            fill="#2563eb"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DepartmentChart; 