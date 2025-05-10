import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '@/services/employeeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeResponse } from '@/services/employeeService';

interface DepartmentStats {
    departmentName: string;
    count: number;
}

const EmployeeStats = () => {
    const { data: employees = [], isLoading } = useQuery<EmployeeResponse[]>({
        queryKey: ['employees'],
        queryFn: () => getEmployees(),
    });

    const getDepartmentStats = (employees: EmployeeResponse[]): DepartmentStats[] => {
        const departmentMap = new Map<string, number>();
        
        employees.forEach(employee => {
            const deptName = employee.department.departmentName;
            const currentCount = departmentMap.get(deptName) || 0;
            departmentMap.set(deptName, currentCount + 1);
        });

        return Array.from(departmentMap.entries()).map(([departmentName, count]) => ({
            departmentName,
            count
        }));
    };

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Loading...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const departmentStats = getDepartmentStats(employees);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Total Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{employees.length}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Employees by Department</CardTitle>
                    <CardDescription>Top 3 departments with the most employees</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {departmentStats.slice(0, 3).map(({ departmentName, count }) => (
                            <div key={departmentName} className="flex justify-between items-center">
                                <span className="text-base font-medium">{departmentName}</span>
                                <span className="text-base text-muted-foreground">{count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmployeeStats; 