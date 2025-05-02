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
import { deleteJobTitle, getJobTitles, JobTitleResponse } from '@/services/jobtitleService';

const JobTitleListPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [jobTitleToDelete, setJobTitleToDelete] = useState<JobTitleResponse | null>(null);

    const queryClient = useQueryClient();

    const {
        data: jobTitles = [],
        isLoading,
        isError,
        error
    } = useQuery<JobTitleResponse[], Error>({
        queryKey: ['jobtitles'],
        queryFn: getJobTitles,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteJobTitle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobtitles'] });
            closeDeleteModal();
        },
        onError: (err: Error) => {
            console.error("Failed to delete department:", err);
        },
    });

    const openDeleteModal = (jobTitle: JobTitleResponse) => {
        setJobTitleToDelete(jobTitle);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setJobTitleToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (!jobTitleToDelete) return;
        deleteMutation.mutate(jobTitleToDelete.id);
    };

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        Loading job titles...
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-destructive">
                        Error loading job titles: {error?.message || 'Unknown error'}
                    </TableCell>
                </TableRow>
            );
        }

        if (!jobTitles || jobTitles.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No job titles found.
                    </TableCell>
                </TableRow>
            );
        }

        return jobTitles.map((jobTitle) => (
            <TableRow key={jobTitle.id}>
                <TableCell className="font-medium w-[100px]">{jobTitle.id}</TableCell>
                <TableCell>{jobTitle.name}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link to={`/jobtitles/edit/${jobTitle.id}`}>Edit</Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(jobTitle)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === jobTitle.id}
                    >
                        {deleteMutation.isPending && deleteMutation.variables === jobTitle.id ? 'Deleting...' : 'Delete'}
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
                        <CardTitle className="text-2xl font-bold">Job Titles</CardTitle>
                        <CardDescription>
                            View and manage your company's job titles.
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link to="/jobtitles/add">Add New Job Title</Link>
                    </Button>
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
                            Are you sure you want to delete the job title "{jobTitleToDelete?.name}"?
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

export default JobTitleListPage; 