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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getleaves, updateLeaveRequest } from '@/services/leaverequestService';
import { Link } from 'react-router-dom';
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

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const LeaveReviewListPage: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
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

    const updateLeaveMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => 
            updateLeaveRequest(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
        },
        onError: (error) => {
            console.error('Error updating leave request:', error);
        }
    });

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

    const handleApprove = (id: number) => {
        updateLeaveMutation.mutate({ id, status: 'approved' });
    };

    const handleDeny = (id: number) => {
        updateLeaveMutation.mutate({ id, status: 'rejected' });
    };

    const getFilteredLeaves = () => {
        if (statusFilter === 'all') {
            return leaves;
        }
        return leaves.filter(leave => leave.status.toLowerCase() === statusFilter);
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

        const filteredLeaves = getFilteredLeaves();

        if (!filteredLeaves || filteredLeaves.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No leave requests found.
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
                    <p className="capitalize">{leaveRequest.status}</p>
                </TableCell>
                <TableCell className="text-right space-x-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(leaveRequest.id)}
                        disabled={updateLeaveMutation.isPending}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeny(leaveRequest.id)}
                        disabled={updateLeaveMutation.isPending}
                    >
                        Deny
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
                        <CardTitle className="text-2xl font-bold">Leave Requests Review</CardTitle>
                        <CardDescription>
                            Review and approve leave requests.
                        </CardDescription>
                        <CardDescription className="mt-2">
                            <Link to="/leave-calendar" className="text-blue-500 hover:text-blue-600">View Leave Calendar</Link>
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select
                            value={statusFilter}
                            onValueChange={(value: StatusFilter) => setStatusFilter(value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Requests</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
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
        </div>
    );
};

export default LeaveReviewListPage; 