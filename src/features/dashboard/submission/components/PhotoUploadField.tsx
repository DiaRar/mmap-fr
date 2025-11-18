import { Camera } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export interface PhotoUploadFieldProps {
  photoPreview: string | null;
  onPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function PhotoUploadField({
  photoPreview,
  onPhotoUpload,
}: PhotoUploadFieldProps): JSX.Element {
  return (
    <Field>
      <FieldLabel>
        <FieldTitle>Photo evidence</FieldTitle>
        <FieldDescription>Snap the dish or upload from your camera roll for visual context.</FieldDescription>
      </FieldLabel>
      <FieldContent>
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border/80 bg-muted/20 px-5 py-10 text-center text-sm text-muted-foreground hover:border-primary/50"
          htmlFor="photo-upload"
        >
          {photoPreview ? (
            <div className="w-full overflow-hidden rounded-2xl shadow-inner">
              <img src={photoPreview} alt="Meal preview" className="w-full object-cover" />
            </div>
          ) : (
            <>
              <Camera className="size-8 text-primary" />
              <p>Add or drag a photo</p>
            </>
          )}
        </label>
        <Input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onPhotoUpload}
        />
      </FieldContent>
    </Field>
  );
}
