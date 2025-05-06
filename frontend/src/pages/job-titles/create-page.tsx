import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createJobTitle, CreateJobTitlePayload } from '@/services/jobtitleService';
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

const formSchema = z.object({
    name: z.string().min(1, { message: "Job title name is required." }).max(255, { message: "Job title name cannot exceed 255 characters." }),
});

export type JobTitleFormValues = z.infer<typeof formSchema>;

const JobTitleCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<JobTitleFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: CreateJobTitlePayload) => createJobTitle(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobtitles'] });
            navigate('/jobtitles');
        },
        onError: (error: any) => {
            console.error('Create department mutation error:', error);
        },
    });

    const isLoading = mutation.isPending;

    const onSubmit = (values: JobTitleFormValues) => {
        mutation.mutate(values);
    };

    return (
        <div className="flex justify-center items-center p-4 mt-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Create New Job Title</CardTitle>
                    <CardDescription>Enter the name for the new job title.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Software Engineer" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate('/jobtitles')} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Job Title'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default JobTitleCreatePage; 