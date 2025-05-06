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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateJobTitlePayload, JobTitleResponse, updateJobTitle } from '@/services/jobtitleService';
import { getJobTitleById } from '@/services/jobtitleService';

const formSchema = z.object({
    name: z
        .string()
        .min(1, { message: 'Job title name is required.' })
        .max(255, { message: 'Job title name cannot exceed 255 characters.' }),
});

export type JobTitleFormValues = z.infer<typeof formSchema>;

const JobTitleUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const jobTitleId = Number(id);
    const queryClient = useQueryClient();

    const {
        data: jobTitle,
        isLoading: isQueryLoading,
        isError: isQueryError,
        error: queryError,
    } = useQuery<JobTitleResponse, Error>({
        queryKey: ['jobtitle', jobTitleId],
        queryFn: () => getJobTitleById(jobTitleId),
        enabled: !!jobTitleId,
    });

    const form = useForm<JobTitleFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (jobTitle) {
            reset({ name: jobTitle.name });
        }
    }, [jobTitle, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateJobTitlePayload) =>
            updateJobTitle(jobTitleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobtitles'] });
            queryClient.invalidateQueries({ queryKey: ['jobtitle', jobTitleId] });
            navigate('/jobtitles');
        },
        onError: (error: any) => {
            console.error('Update job title mutation error:', error);
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading;

    const onSubmit = (values: JobTitleFormValues) => {
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
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Software Engineer"
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
                            onClick={() => navigate('/jobtitles')}
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
                    <CardTitle>Update Job Title</CardTitle>
                    <CardDescription>
                        Modify the details for the job title.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFormContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default JobTitleUpdatePage; 