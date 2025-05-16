import React, { ChangeEvent, useState } from 'react';

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
import { deleteTraining, getTrainings, TrainingResponse } from '@/services/trainingService';
import { Input } from '@/components/ui/input';

const TrainingListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [trainingToDelete, setTrainingToDelete] = useState<TrainingResponse | null>(null);
    const [currentSearchInput, setCurrentSearchInput] = useState<string>('');
    const queryClient = useQueryClient();

    const {
        data: trainings = [],
        isLoading,
        isError,
        error
    } = useQuery<TrainingResponse[], Error>({
        queryKey: ['trainings'],
        queryFn: getTrainings,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTraining,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainings'] });
            closeDeleteModal();
        },
        onError: (err: Error) => {
            console.error("Failed to delete department:", err);
        },
    });

    const openDeleteModal = (training: TrainingResponse) => {
        setTrainingToDelete(training);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setTrainingToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!trainingToDelete) return;
        deleteMutation.mutate(trainingToDelete.id);
    };

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentSearchInput(event.target.value);
    };

    const filterTrainings = (trainings: TrainingResponse[], searchTerm: string): TrainingResponse[] => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        if (!normalizedSearchTerm) return trainings;
        
        return trainings.filter(training => 
            training.name.toLowerCase().includes(normalizedSearchTerm) ||
            training.id.toString().includes(normalizedSearchTerm)
        );
    };

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        Loading trainings...
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-destructive">
                        Error loading trainings: {error?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        const filteredTrainings = filterTrainings(trainings, currentSearchInput);

        if (!filteredTrainings || filteredTrainings.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        {trainings.length === 0 ? 'No trainings found.' : 'No matching trainings found.'}
                    </TableCell>
                </TableRow>
            );
        }

        return filteredTrainings.map((training) => (
            <TableRow key={training.id}>
                <TableCell className="font-medium w-[100px]">{training.id}</TableCell>
                <TableCell>{training.name}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link to={`/trainings/edit/${training.id}`}>Edit</Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(training)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === training.id}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === training.id ? 'Deleting...' : 'Delete'}
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
                        <CardTitle className="text-2xl font-bold">Trainings</CardTitle>
                        <CardDescription>
                            View and manage your company's trainings.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link to="/trainings/add">Add New Training</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap gap-4">
                        <Input
                            placeholder="Search trainings..."
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
                            Are you sure you want to delete the training "{trainingToDelete?.name}"?
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

export default TrainingListPage; 