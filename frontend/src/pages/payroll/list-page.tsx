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
import { deletePayroll, getPayrolls, PayrollResponse } from '@/services/payrollService';
import { Input } from "@/components/ui/input";

const PayrollListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [payrollToDelete, setPayrollToDelete] = useState<PayrollResponse | null>(null);
    const [currentSearchInput, setCurrentSearchInput] = useState<string>('');

    const queryClient = useQueryClient();

    const {
        data: payrolls = [],
        isLoading: isLoadingPayroll,
        isError: isErrorPayroll,
        error: errorPayroll
    } = useQuery<PayrollResponse[], Error>({
        queryKey: ['payrolls'],
        queryFn: () => getPayrolls(),
    });

    const deleteMutation = useMutation({
        mutationFn: deletePayroll,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            closeDeleteModal();
        },
        onError: (err: Error) => {
            console.error("Failed to delete department:", err);
        },
    });

    const openDeleteModal = (payroll: PayrollResponse) => {
        setPayrollToDelete(payroll);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setPayrollToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!payrollToDelete) return;
        deleteMutation.mutate(payrollToDelete.id);
    };

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentSearchInput(event.target.value);
    };

    const filterPayrolls = (payrolls: PayrollResponse[], searchTerm: string): PayrollResponse[] => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        if (!normalizedSearchTerm) return payrolls;
        
        return payrolls.filter(payroll => 
            payroll.employee.firstName.toLowerCase().includes(normalizedSearchTerm) ||
            payroll.employee.lastName.toLowerCase().includes(normalizedSearchTerm) ||
            payroll.id.toString().includes(normalizedSearchTerm) ||
            payroll.grossPay.toString().includes(normalizedSearchTerm) ||
            payroll.netPay.toString().includes(normalizedSearchTerm)
        );
    };

    const renderTableContent = () => {
        if (isLoadingPayroll) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        Loading payrolls...
                    </TableCell>
                </TableRow>
            );
        }

        if (isErrorPayroll) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                        Error loading payrolls: {errorPayroll?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        const filteredPayrolls = filterPayrolls(payrolls, currentSearchInput);

        if (!filteredPayrolls || filteredPayrolls.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        {payrolls.length === 0 ? 'No payrolls found.' : 'No matching payrolls found.'}
                    </TableCell>
                </TableRow>
            );
        }

        return filteredPayrolls.map((payroll: PayrollResponse) => (
            <TableRow key={payroll.id}>
                <TableCell className="font-medium w-[100px]">{payroll.id}</TableCell>
                <TableCell>{payroll.employee.firstName} {payroll.employee.lastName}</TableCell>
                <TableCell>{payroll.payPeriodStartDate}</TableCell>
                <TableCell>{payroll.payPeriodEndDate}</TableCell>
                <TableCell>{payroll.grossPay}</TableCell>
                <TableCell>{payroll.netPay}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link to={`/payrolls/edit/${payroll.id}`}>Edit</Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(payroll)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === payroll.id}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === payroll.id ? 'Deleting...' : 'Delete'}
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
                        <CardTitle className="text-2xl font-bold">Payrolls</CardTitle>
                        <CardDescription>
                            View and manage your company's payrolls.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link to="/payrolls/add">Add New Payroll</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap gap-4">
                        <Input
                            placeholder="Search payrolls..."
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
                                <TableHead>Pay Period Start Date</TableHead>
                                <TableHead>Pay Period End Date</TableHead>
                                <TableHead>Gross Pay</TableHead>
                                <TableHead>Net Pay</TableHead>
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
                            Are you sure you want to delete the payroll "{payrollToDelete?.id}"?
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

export default PayrollListPage; 