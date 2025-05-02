import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigate } from 'react-router-dom';
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
import { loginUser } from '@/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
    const setUser = useAuthStore(state => state._setUser);
    const setLoading = useAuthStore(state => state._setLoading);
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const mutation = useMutation({
        mutationFn: loginUser,
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: (data) => {
            setUser(data.user);
            navigate('/');
        },
        onError: (error) => {
            console.error('Login mutation error:', error);
        },
        onSettled: () => {
            setLoading(false);
        }
    });

    const isLoading = mutation.isPending;
    const apiError = mutation.error;

    const onSubmit = (values: LoginFormValues) => {
        mutation.mutate(values);
    };

    return (
         <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
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
                                            <Input placeholder="m@example.com" {...field} disabled={isLoading} />
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
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>

                            <p>{JSON.stringify(user)}</p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage; 