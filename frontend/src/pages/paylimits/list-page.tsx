import React, { useState, ChangeEvent } from 'react';

import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { deletePayLimit, getPayLimits, PayLimitResponse } from '@/services/paylimitService';
import { Input } from "@/components/ui/input";

const PayLimitListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [payLimitToDelete, setPayLimitToDelete] = useState<PayLimitResponse | null>(null);
    const [currentSearchInput, setCurrentSearchInput] = useState<string>('');

    const queryClient = useQueryClient();

    const {
        data: paylimits = [],
        isLoading,
        isError,
        error
    } = useQuery<PayLimitResponse[], Error>({
        queryKey: ['paylimits'],
        queryFn: getPayLimits,
    });

    const deleteMutation = useMutation({
        mutationFn: deletePayLimit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paylimits'] });
            closeDeleteModal();
        },
        onError: (err: Error) => {
            console.error("Failed to delete pay limit:", err);
        },
    });

    const openDeleteModal = (paylimit: PayLimitResponse) => {
        setPayLimitToDelete(paylimit);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setPayLimitToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!payLimitToDelete) return;
        deleteMutation.mutate(payLimitToDelete.id);
    };

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentSearchInput(event.target.value);
    };

    const filterPayLimits = (paylimits: PayLimitResponse[], searchTerm: string): PayLimitResponse[] => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        if (!normalizedSearchTerm) return paylimits;
        
        return paylimits.filter(paylimit => 
            paylimit.department?.departmentName?.toLowerCase().includes(normalizedSearchTerm) ||
            paylimit.id.toString().includes(normalizedSearchTerm) ||
            paylimit.limit.toString().includes(normalizedSearchTerm)
        );
    };

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        Loading pay limits...
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-destructive">
                        Error loading pay limits: {error?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        const filteredPayLimits = filterPayLimits(paylimits, currentSearchInput);

        if (!filteredPayLimits || filteredPayLimits.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        {paylimits.length === 0 ? 'No pay limits found.' : 'No matching pay limits found.'}
                    </TableCell>
                </TableRow>
            );
        }

        return filteredPayLimits.map((paylimit) => (
            <TableRow key={paylimit.id}>
                <TableCell className="font-medium w-[100px]">{paylimit.id}</TableCell>
                <TableCell>{paylimit.limit}</TableCell>
                <TableCell>{paylimit.department?.departmentName}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link to={`/paylimits/edit/${paylimit.id}`}>Edit</Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(paylimit)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === paylimit.id}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === paylimit.id ? 'Deleting...' : 'Delete'}
                    </Button>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-2xl font-bold">Pay Limits</CardTitle>
                        <CardDescription>
                            View and manage your company's pay limits.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link to="/paylimits/add">Add New Pay Limit</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap gap-4">
                        <Input
                            placeholder="Search pay limits..."
                            value={currentSearchInput}
                            onChange={handleSearchInputChange}
                            className="max-w-xs flex-grow"
                        />
                    </div>
                </CardContent>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Limit</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {renderTableContent()}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the pay limit "{payLimitToDelete?.department?.departmentName}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDeleteModal} disabled={deleteMutation.isPending}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PayLimitListPage; 