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
import { getBenefits, assignBenefit, removeBenefit, BenefitResponse } from '@/services/benefitService';
import { getTrainings, assignTraining, removeTraining, TrainingResponse, AssignTrainingPayload } from '@/services/trainingService';
import { PlusIcon } from "lucide-react";

const NO_SELECTION_SENTINEL = "__NO_SELECTION__";

const DEBOUNCE_DELAY = 500;

const EmployeeListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isBenefitModalOpen, setIsBenefitModalOpen] = useState<boolean>(false);
    const [isTrainingModalOpen, setIsTrainingModalOpen] = useState<boolean>(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeResponse | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
    const [selectedBenefit, setSelectedBenefit] = useState<string>('');
    const [selectedTraining, setSelectedTraining] = useState<string>('');
    const [enrollmentDate, setEnrollmentDate] = useState<string>('');
    const [filters, setFilters] = useState<EmployeeFilters>({});
    const [currentSearchInput, setCurrentSearchInput] = useState<string>('');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [isRemovingBenefit, setIsRemovingBenefit] = useState<boolean>(false);
    const [isRemovingTraining, setIsRemovingTraining] = useState<boolean>(false);

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

    const { data: benefits = [] } = useQuery<BenefitResponse[], Error>({
        queryKey: ['benefits'],
        queryFn: getBenefits,
    });

    const { data: trainings = [] } = useQuery<TrainingResponse[], Error>({
        queryKey: ['trainings'],
        queryFn: getTrainings,
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

    console.log('employees -->', employees);

    const assignBenefitMutation = useMutation({
        mutationFn: assignBenefit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            closeBenefitModal();
        },
        onError: (err: Error) => {
            console.error("Failed to assign benefit:", err);
        },
    });

    const removeBenefitMutation = useMutation({
        mutationFn: ({ employeeId, benefitId }: { employeeId: number; benefitId: number }) => 
            removeBenefit(employeeId, benefitId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setIsRemovingBenefit(false);
        },
        onError: (err: Error) => {
            console.error("Failed to remove benefit:", err);
            setIsRemovingBenefit(false);
        },
    });

    const assignTrainingMutation = useMutation({
        mutationFn: (data: AssignTrainingPayload) => assignTraining(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            closeTrainingModal();
        },
        onError: (err: Error) => {
            console.error("Failed to assign training:", err);
        },
    });

    const removeTrainingMutation = useMutation({
        mutationFn: ({ employeeId, trainingId }: { employeeId: number; trainingId: number }) => 
            removeTraining(employeeId, trainingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setIsRemovingTraining(false);
        },
        onError: (err: Error) => {
            console.error("Failed to remove training:", err);
            setIsRemovingTraining(false);
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

    const openBenefitModal = (employee: EmployeeResponse) => {
        setSelectedEmployee(employee);
        setIsBenefitModalOpen(true);
    };

    const closeBenefitModal = () => {
        setSelectedEmployee(null);
        setSelectedBenefit('');
        setEnrollmentDate('');
        setIsBenefitModalOpen(false);
    };

    const handleAssignBenefit = () => {
        if (!selectedEmployee || !selectedBenefit || !enrollmentDate) return;

        assignBenefitMutation.mutate({
            employeeId: selectedEmployee.id,
            benefitId: parseInt(selectedBenefit, 10),
            enrollmentDate,
        });
    };

    const handleRemoveBenefit = (employeeId: number, benefitId: number) => {
        setIsRemovingBenefit(true);
        removeBenefitMutation.mutate({ employeeId, benefitId });
    };

    const getAvailableBenefits = (employee: EmployeeResponse) => {
        const assignedBenefitIds = new Set(employee.employeeBenefits?.map(eb => eb.benefit.id) || []);
        return benefits.filter(benefit => !assignedBenefitIds.has(benefit.id));
    };

    const openTrainingModal = (employee: EmployeeResponse) => {
        setSelectedEmployee(employee);
        setIsTrainingModalOpen(true);
    };

    const closeTrainingModal = () => {
        setSelectedEmployee(null);
        setSelectedTraining('');
        setIsTrainingModalOpen(false);
    };

    const handleAssignTraining = () => {
        if (!selectedEmployee || !selectedTraining) return;

        assignTrainingMutation.mutate({
            employeeId: selectedEmployee.id,
            trainingId: parseInt(selectedTraining, 10),
        });
    };

    const handleRemoveTraining = (employeeId: number, trainingId: number) => {
        setIsRemovingTraining(true);
        removeTrainingMutation.mutate({ employeeId, trainingId });
    };

    const getAvailableTrainings = (employee: EmployeeResponse) => {
        const assignedTrainingIds = new Set(employee.employeeTraining?.map(et => et.trainingProgram.id) || []);
        return trainings.filter(training => !assignedTrainingIds.has(training.id));
    };

    const renderTableContent = () => {
        if (isLoadingEmployees) {
            return (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                        Loading employees...
                    </TableCell>
                </TableRow>
            );
        }

        if (isErrorEmployees) {
            return (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-destructive">
                        Error loading employees: {errorEmployees?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        if (!employees || employees.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
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
                <TableCell>
                    {employee.employeeBenefits?.length ? 
                        <div className="flex flex-col gap-1">
                            {employee.employeeBenefits.map(eb => (
                                <div key={eb.id} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                                    <span className="text-sm">{eb.benefit.name}</span>
                                    <button
                                        className="text-muted-foreground hover:text-destructive transition-colors ml-auto"
                                        onClick={() => handleRemoveBenefit(employee.id, eb.benefit.id)}
                                        disabled={isRemovingBenefit}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div> : 
                        <span className="text-muted-foreground">No benefits assigned</span>
                    }
                </TableCell>
                <TableCell>
                    {employee.employeeTraining?.length ? 
                        <div className="flex flex-col gap-1">
                            {employee.employeeTraining.map(et => (
                                <div key={et.employeeTrainingId} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                                    <span className="text-sm">{et.trainingProgram.name}</span>
                                    <button
                                        className="text-muted-foreground hover:text-destructive transition-colors ml-auto"
                                        onClick={() => handleRemoveTraining(employee.id, et.trainingProgram.id)}
                                        disabled={isRemovingTraining}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div> : 
                        <span className="text-muted-foreground">No trainings assigned</span>
                    }
                </TableCell>
                <TableCell className="text-right space-x-2 flex flex-row items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openBenefitModal(employee)}
                    >
                        <PlusIcon className="w-4 h-4" />
                        Benefit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTrainingModal(employee)}
                    >
                        <PlusIcon className="w-4 h-4" />
                        Training
                    </Button>
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
                                <TableHead>Benefits</TableHead>
                                <TableHead>Trainings</TableHead>
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

            <Dialog open={isBenefitModalOpen} onOpenChange={setIsBenefitModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Benefit</DialogTitle>
                        <DialogDescription>
                            Assign a benefit to {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="benefit">Benefit</label>
                            <Select value={selectedBenefit} onValueChange={setSelectedBenefit}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a benefit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedEmployee && getAvailableBenefits(selectedEmployee).map((benefit) => (
                                        <SelectItem key={benefit.id} value={String(benefit.id)}>
                                            {benefit.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="enrollmentDate">Enrollment Date</label>
                            <Input
                                type="date"
                                value={enrollmentDate}
                                onChange={(e) => setEnrollmentDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeBenefitModal} disabled={assignBenefitMutation.isPending}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignBenefit}
                            disabled={!selectedBenefit || !enrollmentDate || assignBenefitMutation.isPending}
                        >
                            {assignBenefitMutation.isPending ? 'Assigning...' : 'Assign Benefit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isTrainingModalOpen} onOpenChange={setIsTrainingModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Training</DialogTitle>
                        <DialogDescription>
                            Assign a training to {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="training">Training</label>
                            <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a training" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedEmployee && getAvailableTrainings(selectedEmployee).map((training) => (
                                        <SelectItem key={training.id} value={String(training.id)}>
                                            {training.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeTrainingModal} disabled={assignTrainingMutation.isPending}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignTraining}
                            disabled={!selectedTraining || assignTrainingMutation.isPending}
                        >
                            {assignTrainingMutation.isPending ? 'Assigning...' : 'Assign Training'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EmployeeListPage; 