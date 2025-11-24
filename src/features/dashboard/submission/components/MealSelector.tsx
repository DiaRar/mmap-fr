import { useCallback, useMemo, useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronsUpDown, Plus, Utensils } from 'lucide-react';
import { toast } from 'sonner';
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

import { useMeals, useCreateMeal } from '@/features/dashboard/meals/api';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

interface MealSelection {
  id?: string;
  name: string;
  price?: number | null;
}

export interface MealSelectorProps {
  mealName: string;
  mealId?: string;
  onChange: (selection: MealSelection) => void;
  restaurantId?: string;
  error?: string;
  currentPrice?: number;
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

export function MealSelector({
  mealName,
  mealId,
  onChange,
  restaurantId,
  error,
  currentPrice,
}: MealSelectorProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { data: mealsPage, isFetching } = useMeals({
    placeId: restaurantId,
    searchTerm: debouncedSearch,
  });
  const meals = useMemo(() => mealsPage?.results ?? [], [mealsPage]);
  const { mutateAsync: createMeal, isPending: isCreatingMeal } = useCreateMeal();

  const selectedMeal = useMemo(() => {
    if (mealId) {
      return meals.find((meal) => meal.id === mealId);
    }
    return meals.find((meal) => meal.name === mealName);
  }, [meals, mealId, mealName]);

  const handleSelect = useCallback(
    (selection: MealSelection) => {
      onChange(selection);
      setOpen(false);
      setIsAddingNew(false);
      setNewMealName('');
      setSearchTerm('');
    },
    [onChange]
  );

  const handleAddNew = useCallback(async () => {
    const trimmedName = newMealName.trim();
    if (!trimmedName) return;
    if (!restaurantId) {
      toast.error('Select a restaurant before adding a meal.');
      return;
    }
    if (typeof currentPrice !== 'number' || Number.isNaN(currentPrice) || currentPrice < 1000) {
      toast.error('Enter the meal price (₩1,000+) before adding it.');
      return;
    }

    try {
      const created = await createMeal({
        name: trimmedName,
        place_id: restaurantId,
        price: currentPrice,
      });
      toast.success('Meal added');
      handleSelect({ id: created.id, name: trimmedName, price: currentPrice });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add meal';
      toast.error(message);
    }
  }, [createMeal, currentPrice, handleSelect, newMealName, restaurantId]);

  const handleViewMealDetails = useCallback(() => {
    if (!selectedMeal?.id) {
      return;
    }
    navigate(`/meals/${selectedMeal.id}`, {
      state: {
        placeId: restaurantId,
        mealName: selectedMeal.name,
      },
    });
  }, [navigate, restaurantId, selectedMeal]);

  const CommandContent = (
    <>
      <CommandInput
        placeholder={restaurantId ? 'Search meals...' : 'Select a restaurant first'}
        value={searchTerm}
        onValueChange={setSearchTerm}
        disabled={!restaurantId}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-sm text-muted-foreground">
              {!restaurantId
                ? 'Pick a restaurant to load meals.'
                : isFetching
                  ? 'Loading meals...'
                  : 'No meal found.'}
            </p>
            {!isAddingNew && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNew(true)}
                className="gap-2"
                disabled={!restaurantId}
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
                      void handleAddNew();
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleAddNew()}
                    disabled={!newMealName.trim() || isCreatingMeal}
                    className="flex-1"
                  >
                    {isCreatingMeal ? 'Adding...' : 'Add'}
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
            {restaurantId && meals.length > 0 && (
              <CommandGroup heading="Existing meals">
                {meals.map((meal) => (
                  <CommandItem
                    key={meal.id}
                    value={meal.name}
                    onSelect={() =>
                      handleSelect({
                        id: meal.id,
                        name: meal.name,
                        price: meal.price ?? meal.avg_price,
                      })
                    }
                    className="flex items-center gap-3"
                  >
                    <Utensils className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {meal.place_name} ·{' '}
                        {meal.price ?? meal.avg_price
                          ? new Intl.NumberFormat('ko-KR', {
                              style: 'currency',
                              currency: 'KRW',
                              maximumFractionDigits: 0,
                            }).format(meal.price ?? (meal.avg_price ?? 0))
                          : 'No price yet'}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        'size-4',
                        meal.id === mealId || (!mealId && meal.name === mealName)
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup>
              <CommandItem
                onSelect={() => restaurantId && setIsAddingNew(true)}
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
      <span className={cn('truncate', !mealName && 'text-muted-foreground')}>
        {selectedMeal ? (
          <div className="flex items-center gap-2">
            <Utensils className="size-4" />
            <span>{selectedMeal.name}</span>
          </div>
        ) : mealName ? (
          <div className="flex items-center gap-2">
            <Utensils className="size-4" />
            <span>{mealName}</span>
          </div>
        ) : (
          'Select meal...'
        )}
      </span>
      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
    </Button>
  );

  const detailsLink = selectedMeal?.id ? (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-0 text-xs font-semibold text-primary"
      onClick={handleViewMealDetails}
    >
      View meal insights
    </Button>
  ) : null;

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
                <Command className="rounded-lg border-0" shouldFilter={false}>
                  {CommandContent}
                </Command>
              </div>
            </DrawerContent>
          </Drawer>
          {detailsLink}
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
            <Command shouldFilter={false}>{CommandContent}</Command>
          </PopoverContent>
        </Popover>
        {detailsLink}
        <FieldError
          errors={error ? [{ message: error }] : undefined}
        />
      </FieldContent>
    </Field>
  );
}
