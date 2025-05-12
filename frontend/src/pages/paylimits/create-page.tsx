import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { createPayLimit, CreatePayLimitPayload } from '@/services/paylimitService';
import { getDepartments, DepartmentResponse } from '@/services/departmentService';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
    limit: z.number().min(1, { message: "Pay limit is required." }),
    departmentId: z.number().min(1, { message: "Department is required." }),
});

export type PayLimitFormValues = z.infer<typeof formSchema>;

const PayLimitCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { departmentId } = useParams<{ departmentId: string }>();
    const { data: departments = [] } = useQuery<DepartmentResponse[]>({
        queryKey: ['departments'],
        queryFn: getDepartments,
    });

    const form = useForm<PayLimitFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            limit: 0,
            departmentId: departmentId ? Number(departmentId) : 0,
        },
    });

    const mutation = useMutation({
        mutationFn: (data: CreatePayLimitPayload) => createPayLimit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paylimits'] });
            navigate('/paylimits');
        },
        onError: (error: any) => {
            console.error('Create pay limit mutation error:', error);
        },
    });

    const isLoading = mutation.isPending;

    const onSubmit = (values: PayLimitFormValues) => {
        mutation.mutate(values);
    };

    return (
        <div className="flex justify-center items-center p-4 mt-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Create New Pay Limit</CardTitle>
                    <CardDescription>Enter the pay limit for a department.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="limit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pay Limit</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number"
                                                placeholder="e.g., 10000" 
                                                {...field} 
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                disabled={isLoading} 
                                            />
                                        </FormControl>
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
                                            onValueChange={(value) => field.onChange(Number(value))}
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
                                                {departments.map((department) => (
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
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate('/paylimits')} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Pay Limit'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PayLimitCreatePage; 