import { useCallback, useMemo, useState, useEffect, type JSX } from 'react';
import { Check, ChevronsUpDown, Plus, Utensils } from 'lucide-react';
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

import { mockRecommendations } from '@/features/dashboard/data/mock-data';
import { mockRestaurants } from '@/features/dashboard/data/mock-data';

export interface MealSelectorProps {
  value: string;
  onChange: (value: string, isExisting: boolean) => void;
  restaurantId?: string;
  error?: string;
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

// Extract unique meals from recommendations, grouped by restaurant
const getMealsByRestaurant = () => {
  const mealsMap = new Map<string, { name: string; price: string; restaurantId: string }>();
  
  mockRecommendations.forEach((rec) => {
    const key = `${rec.restaurantId}-${rec.title}`;
    if (!mealsMap.has(key)) {
      mealsMap.set(key, {
        name: rec.title,
        price: rec.price,
        restaurantId: rec.restaurantId,
      });
    }
  });
  
  return Array.from(mealsMap.values());
};

const allMeals = getMealsByRestaurant();

export function MealSelector({
  value,
  onChange,
  restaurantId,
  error,
}: MealSelectorProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const isMobile = useIsMobile();

  const availableMeals = useMemo(() => {
    if (!restaurantId) {
      return allMeals;
    }
    return allMeals.filter((meal) => meal.restaurantId === restaurantId);
  }, [restaurantId]);

  const selectedMeal = useMemo(
    () => availableMeals.find((m) => m.name === value),
    [availableMeals, value]
  );

  const handleSelect = useCallback(
    (mealName: string, isExisting: boolean) => {
      onChange(mealName, isExisting);
      setOpen(false);
      setIsAddingNew(false);
      setNewMealName('');
    },
    [onChange]
  );

  const handleAddNew = useCallback(() => {
    if (newMealName.trim()) {
      handleSelect(newMealName.trim(), false);
    }
  }, [newMealName, handleSelect]);

  const CommandContent = (
    <>
      <CommandInput placeholder="Search meals..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-sm text-muted-foreground">No meal found.</p>
            {!isAddingNew && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNew(true)}
                className="gap-2"
              >
                <Plus className="size-4" />
                Add new meal
              </Button>
            )}
          </div>
        </CommandEmpty>
        {isAddingNew ? (
          <CommandGroup>
            <div className="px-2 py-3">
              <div className="space-y-3">
                <Input
                  placeholder="Meal name"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newMealName.trim()) {
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
                    disabled={!newMealName.trim()}
                    className="flex-1"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewMealName('');
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
            {availableMeals.length > 0 && (
              <CommandGroup heading="Existing meals">
                {availableMeals.map((meal) => {
                  const restaurant = mockRestaurants.find((r) => r.id === meal.restaurantId);
                  return (
                    <CommandItem
                      key={`${meal.restaurantId}-${meal.name}`}
                      value={meal.name}
                      onSelect={() => handleSelect(meal.name, true)}
                      className="flex items-center gap-3"
                    >
                      <Utensils className="size-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{meal.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {restaurant?.name || 'Unknown'} · {meal.price}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          'size-4',
                          value === meal.name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            <CommandGroup>
              <CommandItem
                onSelect={() => setIsAddingNew(true)}
                className="flex items-center gap-2 text-primary"
              >
                <Plus className="size-4" />
                <span>Add new meal</span>
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
        {selectedMeal ? (
          <div className="flex items-center gap-2">
            <Utensils className="size-4" />
            <span>{selectedMeal.name}</span>
          </div>
        ) : value ? (
          <div className="flex items-center gap-2">
            <Utensils className="size-4" />
            <span>{value}</span>
          </div>
        ) : (
          'Select meal...'
        )}
      </span>
      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
    </Button>
  );

  if (isMobile) {
    return (
      <Field>
        <FieldLabel>
          <FieldTitle>Meal name</FieldTitle>
          <FieldDescription>Call out what you ordered.</FieldDescription>
        </FieldLabel>
        <FieldContent>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Select Meal</DrawerTitle>
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
        <FieldTitle>Meal name</FieldTitle>
        <FieldDescription>Call out what you ordered.</FieldDescription>
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

