import { createCompany } from "@/services/authService";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

const createCompanyFormSchema = z.object({
    name: z.string().min(1, { message: "Company name cannot be empty." }),
});

type CreateCompanyFormValues = z.infer<typeof createCompanyFormSchema>;

function CompanyForm() {
    const queryClient = useQueryClient();
    const createCompanyForm = useForm<CreateCompanyFormValues>({
        resolver: zodResolver(createCompanyFormSchema),
        defaultValues: { name: '' },
    });

    const createCompanyMutation = useMutation({
        mutationFn: createCompany,
        onSuccess: () => {
            console.log('Company created successfully!');
            createCompanyForm.reset();
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
        onError: (error) => { console.error('Create company mutation error:', error); },
    });
    const onSubmitCreateCompany = (values: CreateCompanyFormValues) => {
        createCompanyMutation.mutate(values);
    };
    
    return ( 
        <Card className="mb-8">
        <CardHeader>
            <CardTitle>Create New Company</CardTitle>
            <CardDescription>Enter the name for the new company.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...createCompanyForm}>
                <form onSubmit={createCompanyForm.handleSubmit(onSubmitCreateCompany)} className="space-y-4">
                    {createCompanyMutation.error && (
                        <p className="text-sm font-medium text-destructive">
                            {createCompanyMutation.error instanceof Error ? createCompanyMutation.error.message : 'Failed to create company.'}
                        </p>
                    )}
                    {createCompanyMutation.isSuccess && (
                        <p className="text-sm font-medium text-green-600">
                            Company created successfully!
                        </p>
                    )}
                    <FormField
                        control={createCompanyForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Company Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="New Awesome Inc." {...field} disabled={createCompanyMutation.isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={createCompanyMutation.isPending}>
                        {createCompanyMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Company'}
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>

    );
}

export default CompanyForm;