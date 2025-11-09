import {
  useEffect,
  useId,
  useMemo,
  useState,
  type FormEvent,
  type JSX,
  type ReactNode,
} from "react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SuggestRestaurantDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SuggestRestaurantFormState {
  name: string
  neighborhood: string
  cuisine: string
  priceRange: string
  website: string
  notes: string
}

const blankFormState: SuggestRestaurantFormState = {
  name: "",
  neighborhood: "",
  cuisine: "",
  priceRange: "",
  website: "",
  notes: "",
}

export function SuggestRestaurantDrawer({
  open,
  onOpenChange,
}: SuggestRestaurantDrawerProps): JSX.Element {
  const [formState, setFormState] = useState<SuggestRestaurantFormState>(blankFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [didSubmit, setDidSubmit] = useState(false)
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | string | null>(0.5)

  const baseId = useId()
  const fieldIds = useMemo(
    () => ({
      name: `${baseId}-name`,
      neighborhood: `${baseId}-neighborhood`,
      cuisine: `${baseId}-cuisine`,
      priceRange: `${baseId}-price-range`,
      website: `${baseId}-website`,
      notes: `${baseId}-notes`,
    }),
    [baseId],
  )

  useEffect(() => {
    if (!open) {
      const timeoutId = window.setTimeout(() => {
        setFormState(blankFormState)
        setIsSubmitting(false)
        setDidSubmit(false)
        setActiveSnapPoint(0.8)
      }, 200)

      return () => window.clearTimeout(timeoutId)
    }

    return undefined
  }, [open])

  const canSubmit =
    formState.name.trim().length > 0 && formState.neighborhood.trim().length > 0

  const handleChange =
    (field: keyof SuggestRestaurantFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    window.setTimeout(() => {
      setIsSubmitting(false)
      setDidSubmit(true)
    }, 600)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[0.8, 1.0]}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
      modal
    >
      <DrawerContent className="flex h-full max-h-[95vh] flex-col gap-0 rounded-t-3xl border-border/80 bg-background shadow-[0_-24px_48px_-24px_rgba(15,23,42,0.45)]">
        <DrawerHeader className="space-y-1 text-left">
          <DrawerTitle>Suggest a restaurant</DrawerTitle>
          <DrawerDescription>
            Tell us about a great spot we should feature. We’ll review every submission.
          </DrawerDescription>
        </DrawerHeader>

        {didSubmit ? (
          <div className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2">
              <div className="space-y-2">
                <p className="text-base font-semibold text-foreground">
                  Thanks for your suggestion!
                </p>
                <p className="text-sm text-muted-foreground">
                  Our editors will take a look shortly. We’ll feature the best picks in upcoming
                  guides.
                </p>
              </div>
            </div>
            <DrawerFooter
              className="gap-3 border-t border-border/60 bg-background/95 px-4 pt-4 backdrop-blur"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
            >
              <DrawerClose asChild>
                <Button type="button" className="w-full">
                  Back to browsing
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        ) : (
          <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2">
              <div className="space-y-4">
                <Field
                  id={fieldIds.name}
                  label="Restaurant name"
                  description="Who makes the unforgettable meal?"
                >
                  <Input
                    id={fieldIds.name}
                    autoComplete="organization"
                    placeholder="E.g. Golden Hour Bistro"
                    value={formState.name}
                    onChange={handleChange("name")}
                    required
                  />
                </Field>

                <Field
                  id={fieldIds.neighborhood}
                  label="Neighborhood or area"
                  description="Where can we find it?"
                >
                  <Input
                    id={fieldIds.neighborhood}
                    autoComplete="address-level2"
                    placeholder="Downtown waterfront"
                    value={formState.neighborhood}
                    onChange={handleChange("neighborhood")}
                    required
                  />
                </Field>

                <Field
                  id={fieldIds.cuisine}
                  label="Cuisine or vibe"
                  description="Helps us categorize for the community."
                >
                  <Input
                    id={fieldIds.cuisine}
                    placeholder="Modern Mexican, natural wine bar..."
                    value={formState.cuisine}
                    onChange={handleChange("cuisine")}
                  />
                </Field>

                <Field
                  id={fieldIds.priceRange}
                  label="Typical spend"
                  description="Share what guests can expect to spend."
                >
                  <Input
                    id={fieldIds.priceRange}
                    placeholder="$$ · $30-40 per person"
                    value={formState.priceRange}
                    onChange={handleChange("priceRange")}
                  />
                </Field>

                <Field
                  id={fieldIds.website}
                  label="Link (optional)"
                  description="Menu, Instagram, or reservation link."
                >
                  <Input
                    id={fieldIds.website}
                    type="url"
                    inputMode="url"
                    placeholder="https://"
                    value={formState.website}
                    onChange={handleChange("website")}
                  />
                </Field>
              </div>
            </div>

            <DrawerFooter
              className="gap-3 border-t border-border/60 bg-background/95 px-4 pt-4 backdrop-blur"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
            >
              <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-full">
                {isSubmitting ? "Sending..." : "Submit suggestion"}
              </Button>
              <DrawerClose asChild>
                <Button type="button" variant="ghost" className="w-full">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  )
}

interface FieldProps {
  id: string
  label: string
  description?: string
  children: ReactNode
}

function Field({ id, label, description, children }: FieldProps): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

