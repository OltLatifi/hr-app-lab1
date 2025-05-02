import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createDepartment, CreateDepartmentPayload } from '@/services/departmentService';
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

// Validation Schema using Zod
const formSchema = z.object({
    departmentName: z.string().min(1, { message: "Department name is required." }).max(255, { message: "Department name cannot exceed 255 characters." }),
});

export type DepartmentFormValues = z.infer<typeof formSchema>;

const DepartmentCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            departmentName: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: CreateDepartmentPayload) => createDepartment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            navigate('/departments');
        },
        onError: (error: any) => {
            console.error('Create department mutation error:', error);
        },
    });

    const isLoading = mutation.isPending;

    const onSubmit = (values: DepartmentFormValues) => {
        mutation.mutate(values);
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Create New Department</CardTitle>
                    <CardDescription>Enter the name for the new department.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="departmentName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Human Resources" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate('/departments')} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Department'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default DepartmentCreatePage; 