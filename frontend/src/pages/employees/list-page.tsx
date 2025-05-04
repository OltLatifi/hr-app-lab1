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
import { deleteEmployee, getEmployees, EmployeeResponse } from '@/services/employeeService';

const EmployeeListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeResponse | null>(null);

    const queryClient = useQueryClient();

    const {
        data: employees = [],
        isLoading,
        isError,
        error
    } = useQuery<EmployeeResponse[], Error>({
        queryKey: ['employees'],
        queryFn: getEmployees,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            closeDeleteModal();
        },
        onError: (err: Error) => {
            console.error("Failed to delete department:", err);
        },
    });

    const openDeleteModal = (employee: EmployeeResponse) => {
        setEmployeeToDelete(employee);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setEmployeeToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!employeeToDelete) return;
        deleteMutation.mutate(employeeToDelete.id);
    };

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        Loading employees...
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-destructive">
                        Error loading employees: {error?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        if (!employees || employees.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No employees found.
                    </TableCell>
                </TableRow>
            );
        }

        return employees.map((employee: EmployeeResponse) => (
            <TableRow key={employee.id}>
                <TableCell className="font-medium w-[100px]">{employee.id}</TableCell>
                <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.department.departmentName}</TableCell>
                <TableCell>{employee.jobTitle.name}</TableCell>
                <TableCell>{employee.employmentStatus.statusName}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link to={`/employees/edit/${employee.id}`}>Edit</Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(employee)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === employee.id}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === employee.id ? 'Deleting...' : 'Delete'}
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
                        <CardTitle className="text-2xl font-bold">Employees</CardTitle>
                        <CardDescription>
                            View and manage your company's employees.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link to="/employees/add">Add New Employee</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Job Title</TableHead>
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
                            Are you sure you want to delete the employee "{employeeToDelete?.firstName} {employeeToDelete?.lastName}"?
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

export default EmployeeListPage; 