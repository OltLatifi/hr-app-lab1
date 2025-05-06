import React, { useState } from 'react';

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
import { deleteBenefit, getBenefits, BenefitResponse } from '@/services/benefitService';

const BenefitListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [benefitToDelete, setBenefitToDelete] = useState<BenefitResponse | null>(null);

    const queryClient = useQueryClient();

    const {
        data: benefits = [],
        isLoading,
        isError,
        error
    } = useQuery<BenefitResponse[], Error>({
        queryKey: ['benefits'],
        queryFn: getBenefits,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBenefit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['benefits'] });
            closeDeleteModal();
        },
        onError: (err: Error) => {
            console.error("Failed to delete department:", err);
        },
    });

    const openDeleteModal = (benefit: BenefitResponse) => {
        setBenefitToDelete(benefit);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setBenefitToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!benefitToDelete) return;
        deleteMutation.mutate(benefitToDelete.id);
    };

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        Loading benefits...
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-destructive">
                        Error loading benefits: {error?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        if (!benefits || benefits.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No benefits found.
                    </TableCell>
                </TableRow>
            );
        }

        return benefits.map((benefit) => (
            <TableRow key={benefit.id}>
                <TableCell className="font-medium w-[100px]">{benefit.id}</TableCell>
                <TableCell>{benefit.name}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link to={`/benefits/edit/${benefit.id}`}>Edit</Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(benefit)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === benefit.id}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === benefit.id ? 'Deleting...' : 'Delete'}
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
                        <CardTitle className="text-2xl font-bold">Benefits</CardTitle>
                        <CardDescription>
                            View and manage your company's benefits.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link to="/benefits/add">Add New Benefit</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
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
                            Are you sure you want to delete the benefit "{benefitToDelete?.name}"?
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

export default BenefitListPage; 