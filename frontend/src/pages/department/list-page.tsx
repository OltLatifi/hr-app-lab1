import React, { useState, ChangeEvent } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getPayLimitByDepartmentId, PayLimitResponse } from '@/services/paylimitService';
import { getPayrollsByDepartment } from '@/services/payrollService';
import { Input } from "@/components/ui/input";

const DepartmentListPage: React.FC = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentResponse | null>(null);
    const [currentSearchInput, setCurrentSearchInput] = useState<string>('');

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

    const { data: payLimits = [] } = useQuery<(PayLimitResponse | null)[], Error>({
        queryKey: ['paylimits'],
        queryFn: () => Promise.all(
            departments.map(dept => 
                getPayLimitByDepartmentId(dept.departmentId)
                    .catch(() => null)
            )
        ),
        enabled: departments.length > 0,
    });

    const { data: departmentPayrolls = {} } = useQuery<Record<string, number>, Error>({
        queryKey: ['departmentPayrolls'],
        queryFn: getPayrollsByDepartment,
        enabled: departments.length > 0,
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

    const handleAddPayLimit = (departmentId: number) => {
        navigate(`/paylimits/add/${departmentId}`);
    };

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentSearchInput(event.target.value);
    };

    const filterDepartments = (departments: DepartmentResponse[], searchTerm: string): DepartmentResponse[] => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        if (!normalizedSearchTerm) return departments;
        
        return departments.filter(dept => 
            dept.departmentName.toLowerCase().includes(normalizedSearchTerm) ||
            dept.departmentId.toString().includes(normalizedSearchTerm)
        );
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

        const filteredDepartments = filterDepartments(departments, currentSearchInput);

        if (!filteredDepartments || filteredDepartments.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        {departments.length === 0 ? 'No departments found.' : 'No matching departments found.'}
                    </TableCell>
                </TableRow>
            );
        }

        return filteredDepartments.map((dept) => {
            const payLimit = payLimits.find((limit): limit is PayLimitResponse => 
                limit !== null && limit.departmentId === dept.departmentId
            );
            const departmentTotalPayroll = (departmentPayrolls[dept.departmentName] || 0) / 100;
            const exceedsPayLimit = payLimit && departmentTotalPayroll > payLimit.limit;

            console.log(departmentTotalPayroll);
            console.log(payLimit);
            
            return (
                <React.Fragment key={dept.departmentId}>
                    <TableRow>
                        <TableCell className="font-medium w-[100px]">{dept.departmentId}</TableCell>
                        <TableCell>{dept.departmentName}</TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button asChild variant="outline" size="sm">
                                <Link to={`/departments/edit/${dept.departmentId}`}>Edit</Link>
                            </Button>
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
                    {!payLimit && (
                        <TableRow>
                            <TableCell colSpan={3} className="p-0">
                                <Alert 
                                    variant="default" 
                                    className="cursor-pointer bg-gray-200 m-2"
                                    onClick={() => handleAddPayLimit(dept.departmentId)}
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>No Pay Limit Set</AlertTitle>
                                    <AlertDescription>
                                        Click here to set up a pay limit for {dept.departmentName}
                                    </AlertDescription>
                                </Alert>
                            </TableCell>
                        </TableRow>
                    )}
                    {exceedsPayLimit && (
                        <TableRow>
                            <TableCell colSpan={3} className="p-0">
                                <Alert 
                                    variant="destructive" 
                                    className="m-2"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Pay Limit Exceeded</AlertTitle>
                                    <AlertDescription>
                                        Total payroll ({(departmentTotalPayroll).toLocaleString()}) exceeds the pay limit ({payLimit?.limit.toLocaleString()}) for {dept.departmentName}
                                    </AlertDescription>
                                </Alert>
                            </TableCell>
                        </TableRow>
                    )}
                </React.Fragment>
            );
        });
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
                    <Button asChild>
                        <Link to="/departments/add">Add New Department</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap gap-4">
                        <Input
                            placeholder="Search departments..."
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