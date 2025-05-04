import { getAllCompanies, inviteAdmin } from "@/services/authService";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Company } from "@/types/company";

interface Props {
    isAuthorized: boolean;
}

const inviteFormSchema = z.object({
    invitedUserEmail: z.string().email({ message: "Invalid email address." }),
    companyId: z.preprocess(
        (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
        z.number().positive({ message: "Please select a company." })
    ),
});

type InviteFormSchemaType = z.infer<typeof inviteFormSchema>;

function InviteUser({ isAuthorized }: Props) {
    const { data: companies, isLoading: isLoadingCompanies, error: companiesError } = useQuery<Company[], Error>({
        queryKey: ['companies'],
        queryFn: getAllCompanies,
        enabled: isAuthorized === true,
    });

    const inviteForm = useForm<InviteFormSchemaType>({
        resolver: zodResolver(inviteFormSchema) as any,
        defaultValues: { invitedUserEmail: '', companyId: undefined },
    });
    const inviteMutation = useMutation({
        mutationFn: inviteAdmin,
        onSuccess: () => {
            console.log('Invitation sent successfully!');
            inviteForm.reset();
        },
        onError: (error) => { console.error('Invite mutation error:', error); },
    });
    const onSubmitInvite = (values: FieldValues) => {
        const validatedValues = values as InviteFormSchemaType;
        console.log('Submitting invite:', validatedValues);
        inviteMutation.mutate(validatedValues);
    };
    return ( 
        <Card>
        <CardHeader>
            <CardTitle>Invite Company Admin</CardTitle>
            <CardDescription>Enter the email and select the company for the new admin.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...inviteForm}>
                <form onSubmit={inviteForm.handleSubmit(onSubmitInvite)} className="space-y-4">
                    {inviteMutation.error && (
                        <p className="text-sm font-medium text-destructive">
                            {inviteMutation.error instanceof Error ? inviteMutation.error.message : 'Failed to send invitation.'}
                        </p>
                    )}
                    {inviteMutation.isSuccess && (
                        <p className="text-sm font-medium text-green-600">
                            Invitation sent successfully!
                        </p>
                    )}
                    <FormField
                        control={inviteForm.control as any}
                        name="invitedUserEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email to Invite</FormLabel>
                                <FormControl>
                                    <Input placeholder="new.admin@example.com" {...field} disabled={inviteMutation.isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={inviteForm.control as any}
                        name="companyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company</FormLabel>
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value ? field.value.toString() : undefined}
                                    disabled={isLoadingCompanies || inviteMutation.isPending}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a company" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {isLoadingCompanies && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                                        {companiesError && <SelectItem value="error" disabled>Error loading</SelectItem>}
                                        {companies && companies.map((company) => (
                                            <SelectItem key={company.id} value={company.id.toString()}>
                                                {company.name} (ID: {company.id})
                                            </SelectItem>
                                        ))}
                                        {companies && companies.length === 0 && <SelectItem value="noc" disabled>No companies found</SelectItem>}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={inviteMutation.isPending || isLoadingCompanies}>
                        {inviteMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Invitation'}
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
    );
}

export default InviteUser;