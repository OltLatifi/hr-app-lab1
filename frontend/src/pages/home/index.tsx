import PayrollChart from '@/components/payroll-chart';
import EmployeeStats from '@/components/employee-stats';
import DepartmentChart from '@/components/department-chart';

function HomePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
            <div className="grid gap-6">
                <EmployeeStats />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <PayrollChart />
                <DepartmentChart />
            </div>
        </div>
    );
}

export default HomePage;