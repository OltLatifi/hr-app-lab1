import React, { useState, ChangeEvent, useRef, useEffect } from 'react';

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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { deleteEmployee, getEmployees, EmployeeResponse, EmployeeFilters } from '@/services/employeeService';
import { getDepartments, DepartmentResponse } from '@/services/departmentService';
import { getEmploymentStatuses, EmploymentStatusResponse } from '@/services/employmentstatusService';

const NO_SELECTION_SENTINEL = "__NO_SELECTION__";

const DEBOUNCE_DELAY = 500;

const EmployeeListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeResponse | null>(null);
    const [filters, setFilters] = useState<EmployeeFilters>({});
    const [currentSearchInput, setCurrentSearchInput] = useState<string>('');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const queryClient = useQueryClient();

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setFilters(prevFilters => ({
                ...prevFilters,
                searchTerm: currentSearchInput || undefined,
            }));
        }, DEBOUNCE_DELAY);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [currentSearchInput, setFilters]);

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentSearchInput(event.target.value);
    };

    const handleDepartmentChange = (value: string) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            departmentId: value === NO_SELECTION_SENTINEL ? undefined : value,
        }));
    };

    const handleManagerChange = (value: string) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            managerId: value === NO_SELECTION_SENTINEL ? undefined : value,
        }));
    };

    const handleStatusChange = (value: string) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            statusId: value === NO_SELECTION_SENTINEL ? undefined : value,
        }));
    };

    const {
        data: employees = [],
        isLoading: isLoadingEmployees,
        isError: isErrorEmployees,
        error: errorEmployees
    } = useQuery<EmployeeResponse[], Error>({
        queryKey: ['employees', filters],
        queryFn: () => getEmployees(filters),
    });

    const { data: departments = [] } = useQuery<DepartmentResponse[], Error>({
        queryKey: ['departments'],
        queryFn: getDepartments,
    });

    const { data: managers = [] } = useQuery<EmployeeResponse[], Error>({
        queryKey: ['allEmployeesForManagerFilter'],
        queryFn: () => getEmployees(),
    });

    const { data: employmentStatuses = [] } = useQuery<EmploymentStatusResponse[], Error>({
        queryKey: ['employmentStatuses'],
        queryFn: getEmploymentStatuses,
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
        if (isLoadingEmployees) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        Loading employees...
                    </TableCell>
                </TableRow>
            );
        }

        if (isErrorEmployees) {
            return (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                        Error loading employees: {errorEmployees?.message || 'Unknown error'}
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
                    <div className="mb-4 flex flex-wrap gap-4">
                        <Input
                            placeholder="Search employees..."
                            value={currentSearchInput}
                            onChange={handleSearchInputChange}
                            className="max-w-xs flex-grow"
                        />
                        <Select value={filters.departmentId || NO_SELECTION_SENTINEL} onValueChange={handleDepartmentChange}>
                            <SelectTrigger className="max-w-xs flex-grow">
                                <SelectValue placeholder="Filter by Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NO_SELECTION_SENTINEL}>All Departments</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept.departmentId} value={String(dept.departmentId)}>
                                        {dept.departmentName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filters.managerId || NO_SELECTION_SENTINEL} onValueChange={handleManagerChange}>
                            <SelectTrigger className="max-w-xs flex-grow">
                                <SelectValue placeholder="Filter by Manager" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NO_SELECTION_SENTINEL}>All Managers</SelectItem>
                                {managers.map(manager => (
                                    <SelectItem key={manager.id} value={String(manager.id)}>
                                        {manager.firstName} {manager.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filters.statusId || NO_SELECTION_SENTINEL} onValueChange={handleStatusChange}>
                            <SelectTrigger className="max-w-xs flex-grow">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NO_SELECTION_SENTINEL}>All Statuses</SelectItem>
                                {employmentStatuses.map(status => (
                                    <SelectItem key={status.id} value={String(status.id)}>
                                        {status.statusName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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