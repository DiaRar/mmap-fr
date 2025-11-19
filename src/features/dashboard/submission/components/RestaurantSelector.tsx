import { useCallback, useMemo, useState, useEffect, type JSX } from 'react';
import { Check, ChevronsUpDown, Plus, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { mockRestaurants } from '@/features/dashboard/data/mock-data';

export interface RestaurantSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onAddNew?: (name: string) => void;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

export function RestaurantSelector({
  value,
  onChange,
  error,
  onAddNew,
}: RestaurantSelectorProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const isMobile = useIsMobile();

  const selectedRestaurant = useMemo(
    () => mockRestaurants.find((r) => r.name === value),
    [value]
  );

  const handleSelect = useCallback(
    (restaurantName: string) => {
      onChange(restaurantName);
      setOpen(false);
      setIsAddingNew(false);
      setNewRestaurantName('');
    },
    [onChange]
  );

  const handleAddNew = useCallback(() => {
    if (newRestaurantName.trim()) {
      if (onAddNew) {
        onAddNew(newRestaurantName.trim());
      }
      handleSelect(newRestaurantName.trim());
    }
  }, [newRestaurantName, onAddNew, handleSelect]);

  const CommandContent = (
    <>
      <CommandInput placeholder="Search restaurants..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-sm text-muted-foreground">No restaurant found.</p>
            {!isAddingNew && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNew(true)}
                className="gap-2"
              >
                <Plus className="size-4" />
                Add new restaurant
              </Button>
            )}
          </div>
        </CommandEmpty>
        {isAddingNew ? (
          <CommandGroup>
            <div className="px-2 py-3">
              <div className="space-y-3">
                <Input
                  placeholder="Restaurant name"
                  value={newRestaurantName}
                  onChange={(e) => setNewRestaurantName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newRestaurantName.trim()) {
                      e.preventDefault();
                      handleAddNew();
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddNew}
                    disabled={!newRestaurantName.trim()}
                    className="flex-1"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewRestaurantName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CommandGroup>
        ) : (
          <>
            <CommandGroup>
              {mockRestaurants.map((restaurant) => (
                <CommandItem
                  key={restaurant.id}
                  value={restaurant.name}
                  onSelect={handleSelect}
                  className="flex items-center gap-3"
                >
                  <Store className="size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{restaurant.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {restaurant.cuisine} · {restaurant.area}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      'size-4',
                      value === restaurant.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem
                onSelect={() => setIsAddingNew(true)}
                className="flex items-center gap-2 text-primary"
              >
                <Plus className="size-4" />
                <span>Add new restaurant</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </>
  );

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className="w-full justify-between font-normal transition-all hover:border-primary/40 hover:bg-primary/5"
    >
      <span className={cn('truncate', !value && 'text-muted-foreground')}>
        {selectedRestaurant ? (
          <div className="flex items-center gap-2">
            <Store className="size-4" />
            <span>{selectedRestaurant.name}</span>
          </div>
        ) : (
          'Select restaurant...'
        )}
      </span>
      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
    </Button>
  );

  if (isMobile) {
    return (
      <Field>
        <FieldLabel>
          <FieldTitle>Restaurant</FieldTitle>
          <FieldDescription>Where did you eat? Include pop-ups or kiosks too.</FieldDescription>
        </FieldLabel>
        <FieldContent>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Select Restaurant</DrawerTitle>
              </DrawerHeader>
              <div className="overflow-hidden px-4 pb-4">
                <Command className="rounded-lg border-0">
                  {CommandContent}
                </Command>
              </div>
            </DrawerContent>
          </Drawer>
          <FieldError
            errors={error ? [{ message: error }] : undefined}
          />
        </FieldContent>
      </Field>
    );
  }

  return (
    <Field>
      <FieldLabel>
        <FieldTitle>Restaurant</FieldTitle>
        <FieldDescription>Where did you eat? Include pop-ups or kiosks too.</FieldDescription>
      </FieldLabel>
      <FieldContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>{CommandContent}</Command>
          </PopoverContent>
        </Popover>
        <FieldError
          errors={error ? [{ message: error }] : undefined}
        />
      </FieldContent>
    </Field>
  );
}

