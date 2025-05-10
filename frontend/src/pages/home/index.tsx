import PayrollChart from '@/components/payroll-chart';
import EmployeeStats from '@/components/employee-stats';

function HomePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
            <div className="grid gap-6">
                <EmployeeStats />
                <PayrollChart />
            </div>
        </div>
    );
}

export default HomePage;