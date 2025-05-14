import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { registerAdminUser, validateInvitationToken } from '@/services/authService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(3, { message: "Username must be at least 3 characters." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    email: z.string().email({ message: "Invalid email address" }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type RegisterAdminFormValues = Omit<z.infer<typeof formSchema>, 'confirmPassword'>;

const RegisterAdminPage: React.FC = () => {
    const setUser = useAuthStore(state => state._setUser); 
    const setLoading = useAuthStore(state => state._setLoading); 
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid' | 'error'>('idle');
    const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            password: '',
            email: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (!token) {
            setValidationStatus('invalid');
            setValidationError('No invitation token provided in the URL.');
            return;
        }

        const validate = async () => {
            setValidationStatus('validating');
            setValidationError(null);
            try {
                const validationData = await validateInvitationToken(token);
                setInvitedEmail(validationData.email);
                setValidationStatus('valid');
                form.setValue('email', validationData.email, { shouldValidate: true });
            } catch (error) {
                setValidationStatus('invalid');
                setValidationError(error instanceof Error ? error.message : 'Failed to validate invitation token.');
                console.error('Token validation error:', error);
            }
        };

        validate();
    }, [token]);

    const mutation = useMutation({
        mutationFn: (data: RegisterAdminFormValues) => registerAdminUser({ ...data, token: token! }),
        onMutate: () => {
             setLoading(true);
        },
        onSuccess: (data) => {
            setUser(data.user); 
            const role = data.user.role.name;
            if (role === 'Admin') {
                navigate('/admin');
            } else if (role === 'HR') {
                navigate('/');
            } else {
                navigate('/leaves');
            }
        },
        onError: (error) => {
            console.error('Admin registration mutation error:', error);
        },
        onSettled: () => {
            setLoading(false);
        }
    });

    const isLoading = mutation.isPending || validationStatus === 'validating';
    const apiError = mutation.error;

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (validationStatus !== 'valid' || !token) return;
        const { confirmPassword, ...submitData } = values;
        mutation.mutate(submitData);
    };

    const renderContent = () => {
        if (validationStatus === 'idle' || validationStatus === 'validating') {
            return <p className="text-center">Validating invitation...</p>;
        }

        if (validationStatus === 'invalid' || validationStatus === 'error') {
            return (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Invalid Invitation</AlertTitle>
                    <AlertDescription>
                        {validationError || 'This invitation link is invalid, expired, or has already been used.'}
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {apiError && (
                        <p className="text-sm font-medium text-destructive text-center">
                            {apiError instanceof Error ? apiError.message : 'An unexpected error occurred.'}
                        </p>
                    )}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} readOnly disabled={isLoading} value={invitedEmail || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading || validationStatus !== 'valid'}>
                        {isLoading ? 'Registering...' : 'Complete Registration'}
                    </Button>
                </form>
            </Form>
        );
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Register Account</CardTitle>
                    {validationStatus === 'valid' && invitedEmail && (
                        <CardDescription>Complete registration for {invitedEmail}</CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default RegisterAdminPage; 