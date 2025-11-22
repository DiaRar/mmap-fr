import { useCallback, useMemo, useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ArrowLeft, Sparkles, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

import { useMealmapStore } from '@/features/dashboard/store/useMealmapStore';
import type { DietaryTag } from '@/features/dashboard/types';
import { PhotoUploadField } from '@/features/dashboard/submission/components/PhotoUploadField';
import { ReviewCurrencySelector } from '@/features/dashboard/submission/components/ReviewCurrencySelector';
import { DietaryTagSelector } from '@/features/dashboard/submission/components/DietaryTagSelector';
import { ReviewRatingField } from '@/features/dashboard/submission/components/ReviewRatingField';
import { ReviewDraftList } from '@/features/dashboard/submission/components/ReviewDraftList';
import { RestaurantSelector } from '@/features/dashboard/submission/components/RestaurantSelector';
import { MealSelector } from '@/features/dashboard/submission/components/MealSelector';
import { useCreateReview } from '../api';

const dietaryOptions = [
  'Halal',
  'Spicy',
  'Dairy-free',
  'Vegan',
  'Vegetarian',
  'Gluten-free',
  'Nut-free',
  'Low-carb',
] as const satisfies readonly DietaryTag[];

const CURRENCIES = ['₩', '$'] as const;

// We need place_id, so we enforce it
const createReviewSchema = (isExistingMeal: boolean) =>
  z.object({
    placeId: z.string().min(1, 'Select a valid restaurant.'),
    restaurantName: z.string().min(2, 'Add the restaurant name.'),
    mealName: z.string().min(2, 'Give the dish a memorable name.'),
    price: isExistingMeal
      ? z.number().optional()
      : z.number().min(1000, 'Share the price (₩1,000+).'),
    currency: isExistingMeal
      ? z.enum(CURRENCIES).optional()
      : z.enum(CURRENCIES, {
          message: 'Select a currency.',
        }),
    rating: z.number().min(1, 'Rate at least 1 star.').max(5, 'Max 5 stars.'),
    dietaryTags: z.array(z.enum(dietaryOptions)).min(1, 'Pick at least one dietary tag.'),
    visitDate: z.string().min(1, 'Tell us when you visited.'),
    review: z.string().min(10, 'Leave at least 10 characters for context.'), // Reduced for easier testing
    photo: z.any().optional(), // File object
  });

type ReviewFormValues = {
  placeId: string;
  restaurantName: string;
  mealName: string;
  price?: number;
  currency?: CurrencyOption;
  rating: number;
  dietaryTags: DietaryTag[];
  visitDate: string;
  review: string;
  photo?: File;
};
type CurrencyOption = (typeof CURRENCIES)[number];

export function ReviewFormPage(): JSX.Element {
  const navigate = useNavigate();
  const addReviewDraft = useMealmapStore((state) => state.addReviewDraft);
  const reviewDrafts = useMealmapStore((state) => state.reviewDrafts);
  const addPoints = useMealmapStore((state) => state.addPoints);
  const userPoints = useMealmapStore((state) => state.userPoints);
  
  const { mutate: createReview, isPending: isSubmitting } = useCreateReview();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isExistingMeal, setIsExistingMeal] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(createReviewSchema(isExistingMeal)),
    defaultValues: {
      placeId: '',
      restaurantName: '',
      mealName: '',
      price: 12000,
      currency: '₩',
      rating: 4,
      dietaryTags: [],
      visitDate: new Date().toISOString().split('T')[0],
      review: '',
      photo: undefined,
    },
  });

  useEffect(() => {
    form.clearErrors('price');
    form.clearErrors('currency');
    form.trigger(['price', 'currency']);
  }, [isExistingMeal, form]);

  const watchPrice = form.watch('price');
  const currentRating = form.watch('rating');
  const currentCurrency = form.watch('currency');
  const currentDietaryTags = form.watch('dietaryTags');

  const handleCurrencyChange = useCallback(
    (value: CurrencyOption) => {
      form.setValue('currency', value, { shouldValidate: true });
    },
    [form]
  );

  const handleDietaryToggle = useCallback(
    (tag: DietaryTag) => {
      const existing = form.getValues('dietaryTags');
      const updated = existing.includes(tag)
        ? existing.filter((option) => option !== tag)
        : [...existing, tag];
      form.setValue('dietaryTags', updated, { shouldValidate: true });
    },
    [form]
  );

  const handleRatingChange = useCallback(
    (value: number) => {
      form.setValue('rating', value, { shouldValidate: true });
    },
    [form]
  );

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }
    navigate('/', { replace: true });
  }, [navigate]);

  const handleRestaurantChange = useCallback(
    (restaurantName: string, placeId?: string) => {
      form.setValue('restaurantName', restaurantName, { shouldValidate: true });
      if (placeId) {
        form.setValue('placeId', placeId, { shouldValidate: true });
      }
      // Reset meal when restaurant changes
      form.setValue('mealName', '');
      setIsExistingMeal(false);
    },
    [form]
  );

  const handleMealChange = useCallback(
    (mealName: string, isExisting: boolean) => {
      form.setValue('mealName', mealName, { shouldValidate: true });
      setIsExistingMeal(isExisting);
      if (isExisting) {
        form.setValue('price', undefined);
        form.setValue('currency', undefined);
      } else {
        form.setValue('price', 12000);
        form.setValue('currency', '₩');
      }
      form.trigger();
    },
    [form]
  );

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString() ?? null;
      setPhotoPreview(base64);
      form.setValue('photo', file, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: ReviewFormValues) => {
    const pointsAwarded = 50;

    createReview(
      {
        place_id: values.placeId,
        meal_name: values.mealName,
        rating: values.rating,
        text: values.review,
        price: values.price,
        images: values.photo ? [values.photo] : [],
        is_vegan: values.dietaryTags.includes('Vegan') ? 'yes' : 'no',
        is_halal: values.dietaryTags.includes('Halal') ? 'yes' : 'no',
        is_vegetarian: values.dietaryTags.includes('Vegetarian') ? 'yes' : 'no',
        is_spicy: values.dietaryTags.includes('Spicy') ? 'yes' : 'no',
        is_gluten_free: values.dietaryTags.includes('Gluten-free') ? 'yes' : 'no',
        is_dairy_free: values.dietaryTags.includes('Dairy-free') ? 'yes' : 'no',
        is_nut_free: values.dietaryTags.includes('Nut-free') ? 'yes' : 'no',
      },
      {
        onSuccess: () => {
            addPoints(pointsAwarded);
            toast.success('Review submitted!', {
                description: `🏆 +${pointsAwarded} points!`,
            });
            form.reset();
            setPhotoPreview(null);
            navigate('/');
        },
        onError: (error: any) => {
            toast.error('Failed to submit review', {
                description: error.message,
            });
        }
      }
    );
  };

  const recentDrafts = useMemo(() => reviewDrafts.slice(0, 3), [reviewDrafts]);

  return (
    <div className="flex flex-1 flex-col">
      <motion.header
        className="flex items-center gap-3 px-5 pb-4 pt-6 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Button
          variant="default"
          size="icon"
          className="border border-border/40 shadow-sm backdrop-blur-sm"
          onClick={handleBack}
          type="button"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="size-4" />
              Community review
            </div>
            <motion.div
              className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Trophy className="size-3.5" />
              <span>{userPoints} pts</span>
            </motion.div>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
            Leave a quick photo review
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a snapshot, price, and dietary notes so other students avoid unpleasant surprises.
          </p>
        </div>
      </motion.header>

      <main className="flex flex-1 flex-col gap-6 px-5 pb-28 lg:px-8 lg:pb-16">
        <motion.form
          className="flex flex-1 flex-col gap-6 rounded-3xl border border-border/40 bg-gradient-to-br from-background/95 via-background/90 to-primary/5 px-5 py-6 shadow-md shadow-primary/10 backdrop-blur-sm lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:gap-8 lg:p-8"
          onSubmit={form.handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
        >
          <FieldSet className="flex flex-col gap-7">
            <FieldGroup className="gap-6">
              <PhotoUploadField photoPreview={photoPreview} onPhotoUpload={handlePhotoUpload} />

              {/* NOTE: RestaurantSelector needs to propagate ID. 
                  For now assuming it calls onChange(name, id). 
                  I'll need to patch RestaurantSelector if it doesn't. 
              */}
              <RestaurantSelector
                value={form.watch('restaurantName')}
                onChange={handleRestaurantChange}
                error={form.formState.errors.restaurantName?.message || form.formState.errors.placeId?.message}
              />

              <MealSelector
                value={form.watch('mealName')}
                onChange={handleMealChange}
                restaurantId={form.watch('placeId')}
                error={form.formState.errors.mealName?.message}
              />
            </FieldGroup>

            <FieldSeparator>Experience</FieldSeparator>

            <FieldGroup className="gap-6">
              {!isExistingMeal && (
                <>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>Price paid</FieldTitle>
                      <FieldDescription>Rough total including sides or drinks.</FieldDescription>
                    </FieldLabel>
                    <FieldContent className="gap-3">
                      <Controller
                        name="price"
                        control={form.control}
                        render={({ field }) => (
                          <>
                            <Slider
                              value={[field.value || 12000]}
                              onValueChange={(value) => field.onChange(value[0])}
                              min={1000}
                              max={50000}
                              step={500}
                              aria-label="Price in won"
                            />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>₩1k</span>
                              <span>
                                {new Intl.NumberFormat('en', { notation: 'compact' }).format(field.value || 12000)}₩
                              </span>
                              <span>₩50k</span>
                            </div>
                          </>
                        )}
                      />
                      <FieldError
                        errors={
                          form.formState.errors.price
                            ? [{ message: form.formState.errors.price.message }]
                            : undefined
                        }
                      />
                    </FieldContent>
                  </Field>

                  <ReviewCurrencySelector
                    value={currentCurrency || '₩'}
                    options={CURRENCIES}
                    onChange={handleCurrencyChange}
                    error={form.formState.errors.currency?.message}
                  />
                </>
              )}

              <Field>
                <FieldLabel>
                  <FieldTitle>Visit date</FieldTitle>
                  <FieldDescription>Helps track freshness or menu changes.</FieldDescription>
                </FieldLabel>
                <FieldContent>
                  <Input type="date" {...form.register('visitDate')} />
                  <FieldError
                    errors={
                      form.formState.errors.visitDate
                        ? [{ message: form.formState.errors.visitDate.message }]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>

              <DietaryTagSelector
                options={dietaryOptions}
                value={currentDietaryTags}
                onToggle={handleDietaryToggle}
                error={form.formState.errors.dietaryTags?.message}
              />

              <ReviewRatingField
                value={currentRating}
                onChange={handleRatingChange}
                error={form.formState.errors.rating?.message}
              />

              <Field>
                <FieldLabel>
                  <FieldTitle>Written review</FieldTitle>
                  <FieldDescription>
                    Include texture, portion size, or if you&apos;d order again.
                  </FieldDescription>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    rows={5}
                    placeholder="The sambal hits first, then the caramelised garlic. Ask for extra lime to cut the richness."
                    {...form.register('review')}
                  />
                  <FieldError
                    errors={
                      form.formState.errors.review
                        ? [{ message: form.formState.errors.review.message }]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          <aside className="flex flex-col justify-between gap-4 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background/90 to-background/95 p-5 shadow-lg shadow-primary/10">
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">Ready to submit?</h2>
              <p className="text-sm text-muted-foreground">
                Reviews save automatically as drafts. Publish once you&apos;re satisfied with the copy.
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Quick preview
              </p>
              <p className="text-sm text-foreground">
                {form.watch('mealName') || 'Untitled meal'}
                {!isExistingMeal && watchPrice && (
                  <>
                    {' · '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: (currentCurrency || '₩') === '$' ? 'USD' : 'KRW',
                      maximumFractionDigits: 0,
                    }).format(watchPrice)}
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" className="rounded-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => navigate('/recommendations')}
              >
                Read today&apos;s picks
              </Button>
            </div>
          </aside>
        </motion.form>
      </main>

    </div>
  );
}
