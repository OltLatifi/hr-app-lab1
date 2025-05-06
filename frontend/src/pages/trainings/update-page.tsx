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
import { CreateTrainingPayload, TrainingResponse, updateTraining } from '@/services/trainingService';
import { getTrainingById } from '@/services/trainingService';

const formSchema = z.object({
    name: z
        .string()
        .min(1, { message: 'Training name is required.' })
        .max(255, { message: 'Training name cannot exceed 255 characters.' }),
});

export type TrainingFormValues = z.infer<typeof formSchema>;

const TrainingUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const trainingId = Number(id);
    const queryClient = useQueryClient();

    const {
        data: training,
        isLoading: isQueryLoading,
        isError: isQueryError,
        error: queryError,
    } = useQuery<TrainingResponse, Error>({
        queryKey: ['training', trainingId],
        queryFn: () => getTrainingById(trainingId),
        enabled: !!trainingId,
    });

    const form = useForm<TrainingFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (training) {
            reset({ name: training.name });
        }
    }, [training, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateTrainingPayload) =>
            updateTraining(trainingId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainings'] });
            queryClient.invalidateQueries({ queryKey: ['training', trainingId] });
            navigate('/trainings');
        },
        onError: (error: any) => {
            console.error('Update training mutation error:', error);
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading;

    const onSubmit = (values: TrainingFormValues) => {
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
                    Error loading training: {queryError?.message || 'Unknown error'}
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
                                <FormLabel>Training</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Professional Scrum Master"
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
                            onClick={() => navigate('/trainings')}
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
                    <CardTitle>Update Training</CardTitle>
                    <CardDescription>
                        Modify the details for the training.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFormContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default TrainingUpdatePage; 