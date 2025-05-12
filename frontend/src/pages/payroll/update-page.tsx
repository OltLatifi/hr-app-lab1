import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getEmployees } from '@/services/employeeService';
import { getPayrollById, updatePayroll, PayrollResponse } from '@/services/payrollService';

const calculateNetSalary = (grossSalary: number): number => {
    const pensionContribution = grossSalary * 0.05;
    const taxableIncome = grossSalary - pensionContribution;
    
    let incomeTax = 0;
    if (taxableIncome <= 80) {
        incomeTax += 0;
    } else if (taxableIncome < 250) {
        incomeTax += 6.8;
    } else if (taxableIncome < 450) {
        incomeTax += 22.8;
    } else {
        incomeTax += 72.8;
    }

    return grossSalary - pensionContribution - incomeTax;
};

const formSchema = z.object({
    employeeId: z.number().min(1, { message: "Employee is required." }),
    payPeriodStartDate: z.string().min(1, { message: "Pay period start date is required." }),
    payPeriodEndDate: z.string().min(1, { message: "Pay period end date is required." }),
    netPay: z.number().min(0, { message: "Net pay cannot be negative." }),
    grossPay: z.number().min(0, { message: "Gross pay cannot be negative." }),
});

export type PayrollFormValues = z.infer<typeof formSchema>;

const PayrollUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const payrollId = Number(id);
    const queryClient = useQueryClient();

    const {
        data: payroll,
        isLoading: isQueryLoading,
        isError: isQueryError,
        error: queryError,
    } = useQuery<PayrollResponse, Error>({
        queryKey: ['payroll', payrollId],
        queryFn: () => getPayrollById(payrollId),
        enabled: !!payrollId,
    });

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: () => getEmployees(),
    });

    const form = useForm<PayrollFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employeeId: undefined,
            payPeriodStartDate: '',
            payPeriodEndDate: '',
            netPay: 0,
            grossPay: 0,
        }
    });

    const { reset } = form;

    useEffect(() => {
        if (payroll) {
            const payrollData = {
                employeeId: payroll.employeeId,
                payPeriodStartDate: payroll.payPeriodStartDate,
                payPeriodEndDate: payroll.payPeriodEndDate,
                netPay: payroll.netPay,
                grossPay: payroll.grossPay,
            };
            reset(payrollData);
        }
    }, [payroll, reset]);

    const mutation = useMutation({
        mutationFn: (data: PayrollFormValues) => {
            const payload = {
                ...data,
                grossPay: Math.round(data.grossPay * 100),
                netPay: Math.round(data.netPay * 100),
            };
            return updatePayroll(payrollId, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            queryClient.invalidateQueries({ queryKey: ['payroll', payrollId] });
            queryClient.invalidateQueries({ queryKey: ['payrollsByMonth'] });
            navigate('/payrolls');
        },
        onError: (error: any) => {
            console.error('Update payroll mutation error:', error);
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading;

    const onSubmit = (values: PayrollFormValues) => {
        mutation.mutate(values);
    };

    const handleGrossPayChange = (value: string) => {
        const grossPay = parseFloat(value) || 0;
        const netPay = calculateNetSalary(grossPay);
        form.setValue('grossPay', grossPay);
        form.setValue('netPay', netPay);
    };

    const renderFormContent = () => {
        if (isQueryLoading) {
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            );
        }

        if (isQueryError) {
            return (
                <p className="text-destructive">
                    Error loading payroll: {queryError?.message || 'Unknown error'}
                </p>
            );
        }

        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="employeeId" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee</FormLabel>
                                    <Select 
                                        onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                        defaultValue={field.value?.toString()}
                                        value={field.value?.toString()}
                                        disabled={isLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select an employee" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {employees?.map((employee) => (
                                                <SelectItem 
                                                    key={employee.id}
                                                    value={employee.id.toString()}
                                                >
                                                    {employee.firstName} {employee.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="payPeriodStartDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pay Period Start Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="payPeriodEndDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pay Period End Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="grossPay"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gross Pay</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            step="0.01" 
                                            min="0" 
                                            {...field}
                                            onChange={(e) => handleGrossPayChange(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="netPay"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Net Pay</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            step="0.01" 
                                            min="0" 
                                            {...field}
                                            disabled={true}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" type="button" onClick={() => navigate('/payrolls')} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isMutationLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Form>
        );
    }

    return (
        <div className="flex justify-center items-start min-h-screen p-4 pt-10">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Update Payroll</CardTitle>
                    <CardDescription>
                        Modify the details for the payroll.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFormContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default PayrollUpdatePage; 