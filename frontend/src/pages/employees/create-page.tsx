import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createEmployee, CreateEmployeePayload } from '@/services/employeeService';
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
import { getJobTitles } from '@/services/jobtitleService';
import { getDepartments } from '@/services/departmentService';
import { getEmployees } from '@/services/employeeService';
import { getEmploymentStatuses } from '@/services/employmentstatusService';

const formSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required." }).max(255, { message: "First name cannot exceed 255 characters." }),
    lastName: z.string().min(1, { message: "Last name is required." }).max(255, { message: "Last name cannot exceed 255 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    phoneNumber: z.string().min(1, { message: "Phone number is required." }).max(255, { message: "Phone number cannot exceed 255 characters." }),
    dateOfBirth: z.string().min(1, { message: "Date of birth is required." }),
    hireDate: z.string().min(1, { message: "Hire date is required." }),
    jobTitleId: z.number().min(1, { message: "Job title is required." }),
    departmentId: z.number().min(1, { message: "Department is required." }),
    managerId: z.number().optional(),
    employmentStatusId: z.number().min(1, { message: "Employment status is required." }),
});

export type EmployeeFormValues = z.infer<typeof formSchema>;

const EmployeeCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            dateOfBirth: '',
            hireDate: '',
            jobTitleId: undefined,
            departmentId: undefined,
            managerId: undefined,
            employmentStatusId: undefined,
        },
    });

    const mutation = useMutation({
        mutationFn: (data: CreateEmployeePayload) => createEmployee(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            navigate('/employees');
        },
        onError: (error: any) => {
            console.error('Create employee mutation error:', error);
        },
    });

    const isLoading = mutation.isPending;

    const onSubmit = (values: EmployeeFormValues) => {
        mutation.mutate(values);
    };

    const { data: jobTitles } = useQuery({
        queryKey: ['jobTitles'],
        queryFn: getJobTitles
        });

    const { data: departments } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments
    });

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: getEmployees
    });

    const { data: employmentStatuses } = useQuery({
        queryKey: ['employmentStatuses'],
        queryFn: getEmploymentStatuses
    });
    
    return (
        <div className="flex justify-center items-center p-4 mt-8">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Create New Employee</CardTitle>
                    <CardDescription>Enter the details for the new employee.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., John" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Doe" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., john.doe@example.com" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., +1234567890" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date of Birth</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" placeholder="e.g., 1990-01-01" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hireDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hire Date</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" placeholder="e.g., 2021-01-01" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="jobTitleId" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Title</FormLabel>
                                            <Select 
                                                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                defaultValue={field.value?.toString()}
                                                disabled={isLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a job title" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {jobTitles?.map((jobTitle) => (
                                                        <SelectItem 
                                                            key={jobTitle.id}
                                                            value={jobTitle.id.toString()}
                                                        >
                                                            {jobTitle.name}
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
                                    name="departmentId" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <Select 
                                                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                defaultValue={field.value?.toString()}
                                                disabled={isLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departments?.map((department) => (
                                                        <SelectItem 
                                                            key={department.departmentId}
                                                            value={department.departmentId.toString()}
                                                        >
                                                            {department.departmentName}
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
                                    name="managerId" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Manager</FormLabel>
                                            <Select 
                                                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                defaultValue={field.value?.toString()}
                                                disabled={isLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a manager" />
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
                                    name="employmentStatusId" 
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Employment Status</FormLabel>
                                            <Select 
                                                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                defaultValue={field.value?.toString()}
                                                disabled={isLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select an employment status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {employmentStatuses?.map((employmentStatus) => (
                                                        <SelectItem 
                                                            key={employmentStatus.id}
                                                            value={employmentStatus.id.toString()}
                                                        >
                                                            {employmentStatus.statusName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate('/employees')} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Employee'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmployeeCreatePage; 