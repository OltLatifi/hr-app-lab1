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
import {
    updateDepartment,
    getDepartmentById,
    CreateDepartmentPayload,
    DepartmentResponse,
} from '@/services/departmentService';
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
    departmentName: z
        .string()
        .min(1, { message: 'Department name is required.' })
        .max(255, { message: 'Department name cannot exceed 255 characters.' }),
});

export type DepartmentFormValues = z.infer<typeof formSchema>;

const DepartmentUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const departmentId = Number(id);
    const queryClient = useQueryClient();

    const {
        data: department,
        isLoading: isQueryLoading,
        isError: isQueryError,
        error: queryError,
    } = useQuery<DepartmentResponse, Error>({
        queryKey: ['department', departmentId],
        queryFn: () => getDepartmentById(departmentId),
        enabled: !!departmentId, // Only run query if departmentId is valid
    });

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            departmentName: '',
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (department) {
            reset({ departmentName: department.departmentName });
        }
    }, [department, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateDepartmentPayload) =>
            updateDepartment(departmentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            queryClient.invalidateQueries({ queryKey: ['department', departmentId] });
            navigate('/departments');
        },
        onError: (error: any) => {
            console.error('Update department mutation error:', error);
            // TODO: Show user-friendly error message
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading;

    const onSubmit = (values: DepartmentFormValues) => {
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
                    Error loading department: {queryError?.message || 'Unknown error'}
                </p>
            );
        }

        return (
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="departmentName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Human Resources"
                                        {...field}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => navigate('/departments')}
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
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Update Department</CardTitle>
                    <CardDescription>
                        Modify the details for the department.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFormContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default DepartmentUpdatePage; 