import { FC, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  useSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
} from '@/features/admin/api/adminApi';
import type { Specialty, SpecialtyPayload } from '@/features/admin/types';

// ---------------------------------------------------------------------------
// Form Dialog — shared for Create and Edit
// ---------------------------------------------------------------------------

interface SpecialtyFormDialogProps {
  open: boolean;
  initial?: Specialty;
  onClose: () => void;
}

const SpecialtyFormDialog: FC<SpecialtyFormDialogProps> = ({ open, initial, onClose }) => {
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate: create, isPending: isCreating } = useCreateSpecialty();
  const { mutate: update, isPending: isUpdating } = useUpdateSpecialty();
  const isPending = isCreating || isUpdating;

  const handleSubmit = () => {
    setFormError(null);

    if (!name.trim()) {
      setFormError('Specialty name is required.');
      return;
    }

    const payload: SpecialtyPayload = {
      name: name.trim(),
      description: description.trim(),
    };

    if (isEdit) {
      update(
        { id: initial!.id, payload },
        {
          onSuccess: () => {
            toast.success(`"${name}" updated successfully`);
            onClose();
          },
          onError: () => toast.error('Failed to update specialty.'),
        }
      );
    } else {
      create(payload, {
        onSuccess: () => {
          toast.success(`"${name}" added successfully`);
          onClose();
        },
        onError: () => toast.error('Failed to create specialty.'),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Specialty' : 'Add New Specialty'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="specialty-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="specialty-name"
              placeholder="e.g. Cardiology"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError(null);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="specialty-desc">Description</Label>
            <Input
              id="specialty-desc"
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {formError && <p className="text-sm text-destructive font-medium">{formError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Specialty'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Delete Confirm Dialog
// ---------------------------------------------------------------------------

interface DeleteDialogProps {
  specialty: Specialty | null;
  onClose: () => void;
}

const DeleteDialog: FC<DeleteDialogProps> = ({ specialty, onClose }) => {
  const { mutate: remove, isPending } = useDeleteSpecialty();

  const handleConfirm = () => {
    if (!specialty) return;
    remove(specialty.id, {
      onSuccess: () => {
        toast.success(`"${specialty.name}" deleted`);
        onClose();
      },
      onError: () => toast.error('Failed to delete specialty.'),
    });
  };

  return (
    <Dialog open={!!specialty} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Specialty</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground py-2">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-foreground">"{specialty?.name}"</span>?
          {specialty && specialty.doctors_count > 0 && (
            <span className="block mt-2 text-amber-600 font-medium">
              ⚠️ {specialty.doctors_count} doctor(s) are currently assigned to this specialty.
            </span>
          )}
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const SpecialtyManagement: FC = () => {
  const { data: specialties, isLoading, isError, refetch } = useSpecialties();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Specialty | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Specialty | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load specialties" onRetry={refetch} />;

  return (
    <div className="px-4 md:px-8 lg:px-12 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Specialties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage medical specialties available in the system
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Specialty
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            All Specialties
            <Badge variant="outline" className="ml-2 text-xs">
              {specialties?.length ?? 0} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Name</TableHead>
                  <TableHead className="font-semibold text-foreground">Description</TableHead>
                  <TableHead className="font-semibold text-foreground">Doctors</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!specialties || specialties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      No specialties found.
                    </TableCell>
                  </TableRow>
                ) : (
                  specialties.map((specialty) => (
                    <TableRow key={specialty.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        {specialty.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {specialty.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            specialty.doctors_count > 0
                              ? 'border-emerald-500 text-emerald-600'
                              : 'text-muted-foreground'
                          }
                        >
                          {specialty.doctors_count} doctor{specialty.doctors_count !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                            onClick={() => setEditTarget(specialty)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(specialty)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SpecialtyFormDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} />

      {editTarget && (
        <SpecialtyFormDialog
          open={!!editTarget}
          initial={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}

      <DeleteDialog specialty={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
};
