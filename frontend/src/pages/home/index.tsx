import PayrollChart from '@/components/payroll-chart';

function HomePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
            <div className="grid gap-6">
                <PayrollChart />
            </div>
        </div>
    );
}

export default HomePage;