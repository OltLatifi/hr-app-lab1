import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPayrollsByMonth } from '@/services/payrollService';
import {
    useQuery,
} from '@tanstack/react-query';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const PayrollChart = () => {
    const { data: payrollData, isLoading } = useQuery<Record<number, number>>({
        queryKey: ['payrollsByMonth'],
        queryFn: getPayrollsByMonth,
    });

    const data = payrollData
        ? Object.entries(payrollData).map(([month, amount]) => ({
            month: Number(month),
            amount: amount as number / 100
        }))
        : [];

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Payroll Overview</h2>
            <p className="text-gray-500 text-sm">Total payroll for the last 6 months</p>
        </div>
        <div className="w-full h-72">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="month"
                            tickFormatter={(month) => monthNames[month]}
                            stroke="#94a3b8"
                            fontSize={14}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            stroke="#94a3b8"
                            fontSize={14}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: 8, borderColor: '#2563eb' }}
                            formatter={(value: number) => [formatCurrency(value), 'Amount']}
                            labelFormatter={(month) => monthNames[month as number]}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#2563eb"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPayroll)"
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
        </div>
    );
};

export default PayrollChart; 