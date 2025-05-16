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
import { deleteEmploymentStatus, getEmploymentStatuses, EmploymentStatusResponse } from '@/services/employmentstatusService';
import { Input } from "@/components/ui/input";

const EmploymentStatusListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [employmentStatusToDelete, setEmploymentStatusToDelete] = useState<EmploymentStatusResponse | null>(null);
    const [currentSearchInput, setCurrentSearchInput] = useState<string>('');

    const queryClient = useQueryClient();

    const {
        data: employmentStatuses = [],
        isLoading,
        isError,
        error
    } = useQuery<EmploymentStatusResponse[], Error>({
        queryKey: ['employmentstatuses'],
        queryFn: getEmploymentStatuses,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEmploymentStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employmentstatuses'] });
            closeDeleteModal();
        },
        onError: (err: Error) => {
            console.error("Failed to delete department:", err);
        },
    });

    const openDeleteModal = (employmentStatus: EmploymentStatusResponse) => {
        setEmploymentStatusToDelete(employmentStatus);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setEmploymentStatusToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!employmentStatusToDelete) return;
        deleteMutation.mutate(employmentStatusToDelete.id);
    };

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentSearchInput(event.target.value);
    };

    const filterEmploymentStatuses = (statuses: EmploymentStatusResponse[], searchTerm: string): EmploymentStatusResponse[] => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        if (!normalizedSearchTerm) return statuses;
        
        return statuses.filter(status => 
            status.statusName.toLowerCase().includes(normalizedSearchTerm) ||
            status.id.toString().includes(normalizedSearchTerm)
        );
    };

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        Loading employment statuses...
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-destructive">
                        Error loading employment statuses: {error?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        const filteredStatuses = filterEmploymentStatuses(employmentStatuses, currentSearchInput);

        if (!filteredStatuses || filteredStatuses.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        {employmentStatuses.length === 0 ? 'No employment statuses found.' : 'No matching employment statuses found.'}
                    </TableCell>
                </TableRow>
            );
        }

        return filteredStatuses.map((employmentStatus) => (
            <TableRow key={employmentStatus.id}>
                <TableCell className="font-medium w-[100px]">{employmentStatus.id}</TableCell>
                <TableCell>{employmentStatus.statusName}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link to={`/employment-statuses/edit/${employmentStatus.id}`}>Edit</Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(employmentStatus)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === employmentStatus.id}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === employmentStatus.id ? 'Deleting...' : 'Delete'}
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
                        <CardTitle className="text-2xl font-bold">Employment Statuses</CardTitle>
                        <CardDescription>
                            View and manage your company's employment statuses.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link to="/employment-statuses/add">Add New Employment Status</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap gap-4">
                        <Input
                            placeholder="Search employment statuses..."
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
                            Are you sure you want to delete the employment status "{employmentStatusToDelete?.statusName}"?
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

export default EmploymentStatusListPage; 