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
import { CreateBenefitPayload, BenefitResponse, updateBenefit } from '@/services/benefitService';
import { getBenefitById } from '@/services/benefitService';

const formSchema = z.object({
    name: z
        .string()
        .min(1, { message: 'Benefit name is required.' })
        .max(255, { message: 'Benefit name cannot exceed 255 characters.' }),
});

export type BenefitFormValues = z.infer<typeof formSchema>;

const BenefitUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const benefitId = Number(id);
    const queryClient = useQueryClient();

    const {
        data: benefit,
        isLoading: isQueryLoading,
        isError: isQueryError,
        error: queryError,
    } = useQuery<BenefitResponse, Error>({
        queryKey: ['benefit', benefitId],
        queryFn: () => getBenefitById(benefitId),
        enabled: !!benefitId,
    });

    const form = useForm<BenefitFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (benefit) {
            reset({ name: benefit.name });
        }
    }, [benefit, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateBenefitPayload) =>
            updateBenefit(benefitId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['benefits'] });
            queryClient.invalidateQueries({ queryKey: ['benefit', benefitId] });
            navigate('/benefits');
        },
        onError: (error: any) => {
            console.error('Update benefit mutation error:', error);
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading;

    const onSubmit = (values: BenefitFormValues) => {
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
                    Error loading benefit: {queryError?.message || 'Unknown error'}
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
                                <FormLabel>Benefit</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Health Insurance"
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
                            onClick={() => navigate('/benefits')}
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
                    <CardTitle>Update Benefit</CardTitle>
                    <CardDescription>
                        Modify the details for the benefit.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFormContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default BenefitUpdatePage; 