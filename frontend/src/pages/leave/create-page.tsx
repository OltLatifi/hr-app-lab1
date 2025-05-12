import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createLeaveRequest } from '@/services/leaverequestService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEmployees } from '@/services/employeeService';
import { getLeaveTypes } from '@/services/leavetypeService';

const formSchema = z.object({
    employeeId: z.number().min(1, { message: "Employee is required." }),
    leaveTypeId: z.number().min(1, { message: "Leave type is required." }),
    startDate: z.string().min(1, { message: "Start date is required." }),
    endDate: z.string().min(1, { message: "End date is required." }),
    status: z.string().min(1, { message: "Status is required." }),
});

export type LeaveRequestFormValues = z.infer<typeof formSchema>;

const LeaveRequestCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<LeaveRequestFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employeeId: undefined,
            leaveTypeId: undefined,
            startDate: '',
            endDate: '',
            status: 'Pending',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: LeaveRequestFormValues) => createLeaveRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            navigate('/leaves');
        },
        onError: (error: any) => {
            console.error('Create leave request mutation error:', error);
        },
    });

    const isLoading = mutation.isPending;

    const onSubmit = (values: LeaveRequestFormValues) => {
        mutation.mutate(values);
    };

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: () => getEmployees(),
    });

    const { data: leaveTypes } = useQuery({
        queryKey: ['leaveTypes'],
        queryFn: () => getLeaveTypes(),
    });

    return (
        <div className="flex justify-center items-center p-4 mt-8">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Create New Leave Request</CardTitle>
                    <CardDescription>Enter the details for the new leave request.</CardDescription>
                </CardHeader>
                <CardContent>
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
                                <FormField
                                    control={form.control}
                                    name="leaveTypeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Leave Type</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                defaultValue={field.value?.toString()}
                                                disabled={isLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a leave type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {leaveTypes?.map((leaveType) => (
                                                        <SelectItem
                                                            key={leaveType.id}
                                                            value={leaveType.id.toString()}
                                                        >
                                                            {leaveType.typeName}
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
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate('/leaves')} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Leave Request'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LeaveRequestCreatePage; 