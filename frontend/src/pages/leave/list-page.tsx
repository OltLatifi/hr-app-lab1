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
import { deleteLeaveRequest, getleaves } from '@/services/leaverequestService';
import { Input } from "@/components/ui/input";

interface LeaveRequestResponse {
    id: number;
    employee: {
        id: number;
        firstName: string;
        lastName: string;
    };
    leaveType: {
        id: number;
        typeName: string;
    };
    startDate: string;
    endDate: string;
    status: string;
}

const LeaveRequestListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [leaveRequestToDelete, setLeaveRequestToDelete] = useState<LeaveRequestResponse | null>(null);
    const [currentSearchInput, setCurrentSearchInput] = useState<string>('');

    const queryClient = useQueryClient();

    const {
        data: leaves = [],
        isLoading,
        isError,
        error
    } = useQuery<LeaveRequestResponse[], Error>({
        queryKey: ['leaves'],
        queryFn: getleaves,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            closeDeleteModal();
        },
        onError: (err: Error) => {
            console.error("Failed to delete leave request:", err);
        },
    });

    const openDeleteModal = (leaveRequest: LeaveRequestResponse) => {
        setLeaveRequestToDelete(leaveRequest);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setLeaveRequestToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!leaveRequestToDelete) return;
        deleteMutation.mutate(leaveRequestToDelete.id);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'text-green-600';
            case 'rejected':
                return 'text-red-600';
            case 'pending':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentSearchInput(event.target.value);
    };

    const filterLeaveRequests = (leaveRequests: LeaveRequestResponse[], searchTerm: string): LeaveRequestResponse[] => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        if (!normalizedSearchTerm) return leaveRequests;
        
        return leaveRequests.filter(leave => 
            leave.employee.firstName.toLowerCase().includes(normalizedSearchTerm) ||
            leave.employee.lastName.toLowerCase().includes(normalizedSearchTerm) ||
            leave.leaveType.typeName.toLowerCase().includes(normalizedSearchTerm) ||
            leave.status.toLowerCase().includes(normalizedSearchTerm) ||
            leave.id.toString().includes(normalizedSearchTerm)
        );
    };

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        Loading leave requests...
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                        Error loading leave requests: {error?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        const filteredLeaves = filterLeaveRequests(leaves, currentSearchInput);

        if (!filteredLeaves || filteredLeaves.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        {leaves.length === 0 ? 'No leave requests found.' : 'No matching leave requests found.'}
                    </TableCell>
                </TableRow>
            );
        }

        return filteredLeaves.map((leaveRequest) => (
            <TableRow key={leaveRequest.id}>
                <TableCell className="font-medium w-[100px]">{leaveRequest.id}</TableCell>
                <TableCell>{leaveRequest.employee?.firstName} {leaveRequest.employee?.lastName}</TableCell>
                <TableCell>{leaveRequest.leaveType?.typeName}</TableCell>
                <TableCell>{new Date(leaveRequest.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(leaveRequest.endDate).toLocaleDateString()}</TableCell>
                <TableCell className={getStatusColor(leaveRequest.status)}>
                    {leaveRequest.status}
                </TableCell>
                <TableCell className="text-right space-x-2">
                    {leaveRequest.status.toLowerCase() === 'pending' && (
                        <Button asChild variant="outline" size="sm">
                            <Link to={`/leaves/edit/${leaveRequest.id}`}>Edit</Link>
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(leaveRequest)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === leaveRequest.id}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === leaveRequest.id ? 'Deleting...' : 'Delete'}
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
                        <CardTitle className="text-2xl font-bold">Leave Requests</CardTitle>
                        <CardDescription>
                            View and manage your company's leave requests.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link to="/leaves/add">Add New Leave Request</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap gap-4">
                        <Input
                            placeholder="Search leave requests..."
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
                                <TableHead>Employee</TableHead>
                                <TableHead>Leave Type</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
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
                            Are you sure you want to delete the leave request for {leaveRequestToDelete?.employee.firstName} {leaveRequestToDelete?.employee.lastName}?
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

export default LeaveRequestListPage; 