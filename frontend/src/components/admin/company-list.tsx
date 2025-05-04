import { Card, CardContent, CardHeader, CardDescription } from "../ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllCompanies, deleteCompany } from "@/services/authService";
import { CompanyWithAdmin } from "@/types/company";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { useState } from "react";

function CompanyList() {
    const { data: companies, isLoading: isLoadingCompanies, error: companiesError, refetch: refetchCompanies } = useQuery<CompanyWithAdmin[], Error>({
        queryKey: ['companies'],
        queryFn: getAllCompanies,
    });

    const deleteCompanyMutation = useMutation({
        mutationFn: deleteCompany,
        onSuccess: () => {
            refetchCompanies();
        },
    });

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

    return ( 
        <Card>
            <CardHeader>
                <CardDescription>List of all registered companies.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingCompanies && <p>Loading companies...</p>}
                {companiesError && <p className="text-destructive">Error loading companies: {companiesError.message}</p>}
                {companies && companies.length > 0 && (
                    <ul className="space-y-1">
                        {companies.map(c => 
                            <li key={c.id} className="text-sm p-2 border rounded flex items-center gap-4">
                                {c.name} <span className="text-muted-foreground">(ID: {c.id}, Admin: {c?.admin?.name || 'None'})</span>
                                <Button variant="outline" size="sm" onClick={() => {
                                    setSelectedCompanyId(c.id);
                                    setIsDeleteDialogOpen(true);
                                }}>
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </li>
                        )}

                    </ul>
                )}
                {companies && companies.length === 0 && (
                    <p>No companies found.</p>
                )}
            </CardContent>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Warning</DialogTitle>
                        <DialogDescription>
                            Deleting a company will delete all associated data. This action is irreversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => {
                            if (selectedCompanyId) {
                                deleteCompanyMutation.mutate(selectedCompanyId);
                                setIsDeleteDialogOpen(false);
                            }
                        }}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
            </Dialog>
        </Card>
    );
}

export default CompanyList;