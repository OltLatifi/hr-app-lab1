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
import { deleteLeaveType, getLeaveTypes, LeaveTypeResponse } from '@/services/leavetypeService';
import { Input } from "@/components/ui/input";

const LeaveTypeListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [leaveTypeToDelete, setLeaveTypeToDelete] = useState<LeaveTypeResponse | null>(null);
    const [currentSearchInput, setCurrentSearchInput] = useState<string>('');

    const queryClient = useQueryClient();

    const {
        data: leaveTypes = [],
        isLoading,
        isError,
        error
    } = useQuery<LeaveTypeResponse[], Error>({
        queryKey: ['leavetypes'],
        queryFn: getLeaveTypes,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLeaveType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leavetypes'] });
            closeDeleteModal();
        },
        onError: (err: Error) => {
            console.error("Failed to delete department:", err);
        },
    });

    const openDeleteModal = (leaveType: LeaveTypeResponse) => {
        setLeaveTypeToDelete(leaveType);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setLeaveTypeToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!leaveTypeToDelete) return;
        deleteMutation.mutate(leaveTypeToDelete.id);
    };

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentSearchInput(event.target.value);
    };

    const filterLeaveTypes = (leaveTypes: LeaveTypeResponse[], searchTerm: string): LeaveTypeResponse[] => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        if (!normalizedSearchTerm) return leaveTypes;
        
        return leaveTypes.filter(leaveType => 
            leaveType.typeName.toLowerCase().includes(normalizedSearchTerm) ||
            leaveType.id.toString().includes(normalizedSearchTerm)
        );
    };

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        Loading leave types...
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-destructive">
                        Error loading leave types: {error?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        const filteredLeaveTypes = filterLeaveTypes(leaveTypes, currentSearchInput);

        if (!filteredLeaveTypes || filteredLeaveTypes.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        {leaveTypes.length === 0 ? 'No leave types found.' : 'No matching leave types found.'}
                    </TableCell>
                </TableRow>
            );
        }

        return filteredLeaveTypes.map((leaveType) => (
            <TableRow key={leaveType.id}>
                <TableCell className="font-medium w-[100px]">{leaveType.id}</TableCell>
                <TableCell>{leaveType.typeName}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link to={`/leave-types/edit/${leaveType.id}`}>Edit</Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(leaveType)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === leaveType.id}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === leaveType.id ? 'Deleting...' : 'Delete'}
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
                        <CardTitle className="text-2xl font-bold">Leave Types</CardTitle>
                        <CardDescription>
                            View and manage your company's leave types.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link to="/leave-types/add">Add New Leave Type</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap gap-4">
                        <Input
                            placeholder="Search leave types..."
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
                            Are you sure you want to delete the leave type "{leaveTypeToDelete?.typeName}"?
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

export default LeaveTypeListPage; 