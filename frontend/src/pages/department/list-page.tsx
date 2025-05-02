import React, { useState } from 'react';

import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import {
    getDepartments,
    deleteDepartment,
    DepartmentResponse,
} from '@/services/departmentService';
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
import { useNavigate } from 'react-router-dom';

const DepartmentListPage: React.FC = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentResponse | null>(null);

    const queryClient = useQueryClient();

    const {
        data: departments = [],
        isLoading,
        isError,
        error
    } = useQuery<DepartmentResponse[], Error>({
        queryKey: ['departments'],
        queryFn: getDepartments,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            closeDeleteModal();
        },
        onError: (err: Error) => {
            console.error("Failed to delete department:", err);
        },
    });

    const handleAdd = () => {
        navigate('/departments/add');
    };

    const handleEdit = (id: number) => {
        navigate(`/departments/edit/${id}`);
    };

    const openDeleteModal = (department: DepartmentResponse) => {
        setDepartmentToDelete(department);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDepartmentToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!departmentToDelete) return;
        deleteMutation.mutate(departmentToDelete.departmentId);
    };

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        Loading departments...
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-destructive">
                        Error loading departments: {error?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        if (!departments || departments.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No departments found.
                    </TableCell>
                </TableRow>
            );
        }

        return departments.map((dept) => (
            <TableRow key={dept.departmentId}>
                <TableCell className="font-medium w-[100px]">{dept.departmentId}</TableCell>
                <TableCell>{dept.departmentName}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(dept.departmentId)}>Edit</Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(dept)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === dept.departmentId}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === dept.departmentId ? 'Deleting...' : 'Delete'}
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
                        <CardTitle className="text-2xl font-bold">Departments</CardTitle>
                        <CardDescription>
                            View and manage your company's departments.
                        </CardDescription>
                    </div>
                    <Button onClick={handleAdd}>Add New Department</Button>
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
                            Are you sure you want to delete the department "{departmentToDelete?.departmentName}"?
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

export default DepartmentListPage; 