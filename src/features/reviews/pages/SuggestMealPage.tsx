import { useCallback, useMemo, useState, type JSX } from "react"
import { ArrowLeft, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
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
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type SuggestMealFormState = {
  mealName: string
  restaurantName: string
  location: string
  cuisine: string
  priceRange: number
  dietaryTags: string[]
  waitTime: number
  notes: string
}

const INITIAL_FORM: SuggestMealFormState = {
  mealName: "",
  restaurantName: "",
  location: "",
  cuisine: "",
  priceRange: 2,
  dietaryTags: [],
  waitTime: 15,
  notes: "",
}

const PRICE_BANDS: Record<number, { label: string; helper: string }> = {
  1: { label: "Budget-friendly", helper: "Great for everyday cravings" },
  2: { label: "Casual treat", helper: "Typical dinner pricing" },
  3: { label: "Special outing", helper: "Ideal for celebrations" },
  4: { label: "Splurge", helper: "Premium dining experience" },
}

const DIETARY_OPTIONS = [
  "Vegan",
  "Vegetarian",
  "Gluten-free",
  "Dairy-free",
  "Halal",
  "Nut-free",
  "Low-carb",
]

export function SuggestMealPage(): JSX.Element {
  const navigate = useNavigate()
  const [formState, setFormState] = useState<SuggestMealFormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof SuggestMealFormState, string>>>({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.state?.idx > 0) {
      navigate(-1)
      return
    }

    navigate("/", { replace: true })
  }, [navigate])

  const priceBand = useMemo(() => PRICE_BANDS[formState.priceRange], [formState.priceRange])

  const handleInputChange =
    (field: keyof SuggestMealFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.currentTarget.value
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Partial<Record<keyof SuggestMealFormState, string>> = {}

    if (!formState.mealName.trim()) {
      nextErrors.mealName = "Give the meal a memorable name."
    }

    if (!formState.restaurantName.trim()) {
      nextErrors.restaurantName = "Let us know where to find it."
    }

    if (!formState.location.trim()) {
      nextErrors.location = "Add a neighbourhood or landmark."
    }

    if (!formState.cuisine.trim()) {
      nextErrors.cuisine = "Share the cuisine or flavour profile."
    }

    const hasErrors = Object.values(nextErrors).some(Boolean)

    if (hasErrors) {
      setErrors(nextErrors)
      toast.error("Almost there!", {
        description: "Fill in the highlighted details before submitting.",
      })
      return
    }

    setErrors({})

    toast.success("Meal suggestion sent", {
      description: `${formState.mealName} at ${formState.restaurantName} is on its way to the reviews team.`,
    })

    setFormState(INITIAL_FORM)
    setIsPreviewOpen(false)
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 px-5 pb-4 pt-6 sm:px-6 lg:px-8">
        <Button
          variant="default"
          size="icon"
          className="border border-border/40 shadow-sm backdrop-blur-sm"
          onClick={handleBack}
          type="button"
          aria-label="Back to reviews"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-4" />
            Fresh recommendation
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
            Suggest a standout meal
          </h1>
          <p className="text-sm text-muted-foreground">
            Pair your go-to dish with the essential details so everyone can order like a regular.
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-5 pb-20 lg:px-8 lg:pb-12">
        <form
          className="flex flex-1 flex-col gap-6 rounded-3xl border border-border/40 bg-background/80 px-5 py-6 shadow-md shadow-primary/5 backdrop-blur-sm lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:gap-8 lg:p-8"
          onSubmit={handleSubmit}
        >
          <FieldSet className="flex flex-col gap-7">
            <FieldGroup className="gap-6">
              <Field>
                <FieldLabel>
                  <FieldTitle>Meal name</FieldTitle>
                  <FieldDescription>
                    What should we call this crowd-pleaser?
                  </FieldDescription>
                </FieldLabel>
                <FieldContent>
                  <Input
                    value={formState.mealName}
                    onChange={handleInputChange("mealName")}
                    placeholder="Midnight truffle ramyeon"
                    aria-invalid={Boolean(errors.mealName)}
                    required
                  />
                  <FieldError errors={errors.mealName ? [{ message: errors.mealName }] : undefined} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Restaurant</FieldTitle>
                  <FieldDescription>
                    Who makes it best? Add any pop-ups or market stalls too.
                  </FieldDescription>
                </FieldLabel>
                <FieldContent>
                  <Input
                    value={formState.restaurantName}
                    onChange={handleInputChange("restaurantName")}
                    placeholder="Seollal Supper Club"
                    aria-invalid={Boolean(errors.restaurantName)}
                    required
                  />
                  <FieldError
                    errors={errors.restaurantName ? [{ message: errors.restaurantName }] : undefined}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Neighbourhood</FieldTitle>
                  <FieldDescription>Share a landmark or building to make it easy to find.</FieldDescription>
                </FieldLabel>
                <FieldContent>
                  <Input
                    value={formState.location}
                    onChange={handleInputChange("location")}
                    placeholder="KAIST W8 rooftop, Daejeon"
                    aria-invalid={Boolean(errors.location)}
                    required
                  />
                  <FieldError errors={errors.location ? [{ message: errors.location }] : undefined} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Cuisine or vibe</FieldTitle>
                  <FieldDescription>
                    Korean comfort, neo-bistro, plant-forward – anything that sets expectations.
                  </FieldDescription>
                </FieldLabel>
                <FieldContent>
                  <Input
                    value={formState.cuisine}
                    onChange={handleInputChange("cuisine")}
                    placeholder="Modern Korean izakaya"
                    aria-invalid={Boolean(errors.cuisine)}
                    required
                  />
                  <FieldError errors={errors.cuisine ? [{ message: errors.cuisine }] : undefined} />
                </FieldContent>
              </Field>
            </FieldGroup>

            <FieldSeparator>Experience</FieldSeparator>

            <FieldGroup className="gap-6">
              <Field>
                <FieldLabel>
                  <FieldTitle>Price range</FieldTitle>
                  <FieldDescription>
                    {priceBand.label} — {priceBand.helper}
                  </FieldDescription>
                </FieldLabel>
                <FieldContent className="gap-4">
                  <Slider
                    value={[formState.priceRange]}
                    min={1}
                    max={4}
                    step={1}
                    onValueChange={(value) =>
                      setFormState((prev) => ({
                        ...prev,
                        priceRange: value[0] ?? prev.priceRange,
                      }))
                    }
                    aria-label="Price range"
                  />
                  <div className="grid grid-cols-4 justify-items-center text-xs text-muted-foreground">
                    {Object.keys(PRICE_BANDS).map((band) => (
                      <span key={band} className="tabular-nums">
                        {"$".repeat(Number(band))}
                      </span>
                    ))}
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Dietary friendly tags</FieldTitle>
                  <FieldDescription>Select all that apply.</FieldDescription>
                </FieldLabel>
                <FieldContent>
                  <ToggleGroup
                    type="multiple"
                    className="flex flex-wrap justify-start gap-2"
                    value={formState.dietaryTags}
                    onValueChange={(values) =>
                      setFormState((prev) => ({
                        ...prev,
                        dietaryTags: values,
                      }))
                    }
                  >
                    {DIETARY_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option}
                        value={option}
                        variant="outline"
                        className="rounded-full px-3 text-xs font-medium"
                      >
                        {option}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Typical wait time</FieldTitle>
                  <FieldDescription>
                    From arrival to first bite. Perfect if lines are part of the story.
                  </FieldDescription>
                </FieldLabel>
                <FieldContent className="gap-4">
                  <Slider
                    value={[formState.waitTime]}
                    onValueChange={(value) =>
                      setFormState((prev) => ({
                        ...prev,
                        waitTime: value[0] ?? prev.waitTime,
                      }))
                    }
                    min={0}
                    max={60}
                    step={5}
                    aria-label="Wait time in minutes"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {[0, 15, 30, 45, 60].map((mark) => (
                      <span key={mark}>{mark}m</span>
                    ))}
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Insider notes</FieldTitle>
                  <FieldDescription>
                    Timing hacks, secret toppings, or how to order like a regular.
                  </FieldDescription>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    value={formState.notes}
                    onChange={handleInputChange("notes")}
                    placeholder="Ask for the torch-charred sesame butter on the side – it sells out fast."
                    rows={4}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          <aside className="flex flex-col justify-between gap-4 rounded-3xl border border-border/30 bg-background/70 p-5 shadow-sm shadow-primary/5 lg:sticky lg:top-8">
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">Ready to share?</h2>
              <p className="text-sm text-muted-foreground">
                Preview your submission or fire it off right away. We&apos;ll surface the best meals in
                the reviews feed.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-dashed"
                  >
                    Preview suggestion
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[28px] px-6 pb-10 pt-6">
                  <SheetHeader className="text-left">
                    <SheetTitle>{formState.mealName || "Untitled meal suggestion"}</SheetTitle>
                    <SheetDescription>
                      {formState.restaurantName
                        ? `${formState.restaurantName} · ${formState.location || "location TBD"}`
                        : "Add the restaurant details to complete the preview."}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-4 text-sm">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Cuisine
                      </h3>
                      <p className="text-foreground">
                        {formState.cuisine || "Add a cuisine so readers know what to expect."}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Price insight
                      </h3>
                      <p className="text-foreground">{priceBand.label}</p>
                      <p className="text-xs text-muted-foreground">{priceBand.helper}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Dietary friendly
                      </h3>
                      <p className="text-foreground">
                        {formState.dietaryTags.length > 0
                          ? formState.dietaryTags.join(", ")
                          : "Select any dietary-friendly notes."}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Wait time
                      </h3>
                      <p className="text-foreground">
                        {formState.waitTime > 0
                          ? `${formState.waitTime} minute wait on average`
                          : "Usually ready immediately"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Insider notes
                      </h3>
                      <p className="text-foreground">
                        {formState.notes || "Share any sequencing tips or off-menu upgrades."}
                      </p>
                    </div>
                  </div>

                  <SheetFooter className="mt-6">
                    <Button
                      type="button"
                      onClick={() => setIsPreviewOpen(false)}
                      className="rounded-full"
                    >
                      Looks good
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <Button type="submit" className="rounded-full">
                Submit suggestion
              </Button>
            </div>
          </aside>
        </form>
      </main>
    </div>
  )
}
