import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { JSX } from 'react';

export interface AddRestaurantCTAProps {
  onAddClick?: () => void;
}

export function AddRestaurantCTA({ onAddClick }: AddRestaurantCTAProps): JSX.Element {
  return (
    <Card className="border-dashed border-border/70 bg-gradient-to-r from-white/90 to-primary/10 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg">Missing a favourite?</CardTitle>
          <CardDescription>
            Share your go-to spots so the community can discover them too.
          </CardDescription>
        </div>
        <PlusCircle className="size-6 text-primary" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <Button
          className="rounded-full px-4"
          variant="default"
          onClick={onAddClick}
          aria-label="Add a restaurant"
        >
          Suggest a restaurant
        </Button>
      </CardContent>
    </Card>
  );
}
