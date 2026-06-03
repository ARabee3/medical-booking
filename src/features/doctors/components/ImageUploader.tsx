import { FC, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Upload, Trash2, Image as ImageIcon, GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useOwnImages,
  useUploadImage,
  useDeleteImage,
  useUpdateImage,
} from '@/features/doctors/api/doctorsApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { DoctorImage, DoctorImageKind } from '@/types/global';

const KIND_LABELS: Record<DoctorImageKind, string> = {
  CLINIC: 'Clinic',
  CERTIFICATE: 'Certificate',
};

interface ImageUploaderProps {
  kind: DoctorImageKind;
}

export const ImageUploader: FC<ImageUploaderProps> = ({ kind }) => {
  const { data: images = [], isLoading } = useOwnImages(kind);
  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteImage();
  const updateMutation = useUpdateImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageToDelete, setImageToDelete] = useState<DoctorImage | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [captionValues, setCaptionValues] = useState<Record<number, string>>({});

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('kind', kind);

      uploadMutation.mutate(formData, {
        onSuccess: () => toast.success('Image uploaded successfully'),
        onError: () => toast.error('Failed to upload image'),
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [kind, uploadMutation]
  );

  const handleDelete = (image: DoctorImage) => {
    deleteMutation.mutate(image.id, {
      onSuccess: () => {
        toast.success('Image deleted');
        setImageToDelete(null);
      },
      onError: () => toast.error('Failed to delete image'),
    });
  };

  const handleCaptionChange = (imageId: number, caption: string) => {
    setCaptionValues((prev) => ({ ...prev, [imageId]: caption }));
  };

  const handleCaptionSave = (image: DoctorImage) => {
    const newCaption = captionValues[image.id] ?? image.caption;
    updateMutation.mutate(
      { id: image.id, updates: { caption: newCaption } },
      {
        onSuccess: () => toast.success('Caption updated'),
      }
    );
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...images];
    const [draggedItem] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, draggedItem);

    reordered.forEach((image, index) => {
      if (image.order !== index) {
        updateMutation.mutate({ id: image.id, updates: { order: index } });
      }
    });

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`relative group rounded-lg border overflow-hidden transition-all ${
              dragOverIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''
            } ${dragIndex === index ? 'opacity-50' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
          >
            <div className="aspect-square relative">
              <img
                src={image.image_url}
                alt={image.caption || `${KIND_LABELS[kind]} image`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5 text-white drop-shadow" />
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setImageToDelete(image)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-2 bg-background">
              <Input
                value={captionValues[image.id] ?? image.caption}
                onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                onBlur={() => handleCaptionSave(image)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCaptionSave(image);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="Add caption..."
                className="h-7 text-xs"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploadMutation.isPending ? (
            <LoadingSpinner />
          ) : (
            <>
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Add {KIND_LABELS[kind]} Image</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length === 0 && !uploadMutation.isPending && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {KIND_LABELS[kind].toLowerCase()} images yet.</p>
          <p className="text-xs mt-1">Click the upload area above to add your first image.</p>
        </div>
      )}

      <Dialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <X className="h-5 w-5" />
              Delete Image
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {imageToDelete && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={imageToDelete.image_url}
                alt={imageToDelete.caption || 'Image to delete'}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setImageToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => imageToDelete && handleDelete(imageToDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
