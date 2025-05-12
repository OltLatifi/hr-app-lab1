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
import { CreateEmployeePayload, EmployeeResponse, updateEmployee } from '@/services/employeeService';
import { getEmployeeById } from '@/services/employeeService';
import { getJobTitles } from '@/services/jobtitleService';
import { getDepartments } from '@/services/departmentService';
import { getEmployees } from '@/services/employeeService';
import { getEmploymentStatuses } from '@/services/employmentstatusService';

const formSchema = z.object({
    firstName: z
        .string()
        .min(1, { message: 'Employee first name is required.' })
        .max(255, { message: 'Employee first name cannot exceed 255 characters.' }),
    lastName: z
        .string()
        .min(1, { message: 'Employee last name is required.' })
        .max(255, { message: 'Employee last name cannot exceed 255 characters.' }),
    email: z
        .string()
        .email({ message: 'Invalid email address.' }),
    phoneNumber: z
        .string()
        .min(1, { message: 'Phone number is required.' })
        .max(255, { message: 'Phone number cannot exceed 255 characters.' }),
    dateOfBirth: z
        .string()
        .min(1, { message: 'Date of birth is required.' }),
    hireDate: z
        .string()
        .min(1, { message: 'Hire date is required.' }),
    jobTitleId: z
        .coerce.number()
        .min(1, { message: 'Job title is required.' }),
    departmentId: z
        .coerce.number()
        .min(1, { message: 'Department is required.' }),
    managerId: z
        .coerce.number()
        .optional(),
    employmentStatusId: z
        .coerce.number()
        .min(1, { message: 'Employment status is required.' }),
});

export type EmployeeFormValues = z.infer<typeof formSchema>;

const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '';
        }
        return date.toISOString().slice(0, 16);
    } catch (error) {
        console.error("Error formatting date:", error);
        return '';
    }
};

const EmployeeUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const employeeId = Number(id);
    const queryClient = useQueryClient();

    const {
        data: employee,
        isLoading: isQueryLoading,
        isError: isQueryError,
        error: queryError,
    } = useQuery<EmployeeResponse, Error>({
        queryKey: ['employee', employeeId],
        queryFn: () => getEmployeeById(employeeId),
        enabled: !!employeeId,
    });

    const {
        data: jobTitles,
    } = useQuery({
        queryKey: ['jobTitles'],
        queryFn: getJobTitles,
    });

    const { data: departments } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments
    });

    const { data: employees } = useQuery<EmployeeResponse[]>({
        queryKey: ['employees'],
        queryFn: () => getEmployees()
    });

    const { data: employmentStatuses } = useQuery({
        queryKey: ['employmentStatuses'],
        queryFn: getEmploymentStatuses
    });

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            dateOfBirth: '',
            hireDate: '',
            jobTitleId: 0,
            departmentId: 0,
            managerId: undefined,
            employmentStatusId: 0,
        }
    });

    const { reset } = form;

    useEffect(() => {
        if (employee) {
            const employeeData = {
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phoneNumber: employee.phoneNumber,
                dateOfBirth: formatDateForInput(employee.dateOfBirth),
                hireDate: formatDateForInput(employee.hireDate),
                jobTitleId: employee.jobTitle?.id ?? 0,
                departmentId: employee.department?.departmentId ?? 0,
                managerId: employee.manager?.id,
                employmentStatusId: employee.employmentStatus?.id ?? 0
            };
            reset(employeeData);

        }
    }, [employee, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateEmployeePayload) =>
            updateEmployee(employeeId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
            navigate('/employees');
        },
        onError: (error: any) => {
            console.error('Update employee mutation error:', error);
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading;

    const onSubmit = (values: EmployeeFormValues) => {
        mutation.mutate(values);
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
                    Error loading job title: {queryError?.message || 'Unknown error'}
                </p>
            );
        }

        return (
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
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value)}
                                            defaultValue={field.value?.toString()}
                                            value={field.value?.toString()}
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
                                );
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="departmentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value)}
                                        defaultValue={field.value?.toString()}
                                        value={field.value?.toString()}
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
                                        onValueChange={(value) => field.onChange(value)}
                                        defaultValue={field.value?.toString()}
                                        value={field.value?.toString()}
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
                                        onValueChange={(value) => field.onChange(value)}
                                        defaultValue={field.value?.toString()}
                                        value={field.value?.toString()}
                                        disabled={isLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select an employment status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {employmentStatuses?.map((status) => (
                                                <SelectItem
                                                    key={status.id}
                                                    value={status.id.toString()}
                                                >
                                                    {status.statusName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-6">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => navigate('/employees')}
                            disabled={isLoading}
                        >
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
                    <CardTitle>Update Employee</CardTitle>
                    <CardDescription>
                        Modify the details for the employee.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFormContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default EmployeeUpdatePage; 