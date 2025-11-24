# Frontend TODO (mmap-gay/mmap)
### Swagger docs
- You can find api docs at `docs/openapi.toon`.

## RestaurantSearch.tsx - dynamic location
- [ ] Replace the hard-coded `"KAIST W8..."` copy in `RestaurantSearch.tsx` with data from the existing `useLocation()` hook so the badge always reflects the user’s actual coordinates. Surface three explicit states (loading, resolved, permission denied) so the UI doesn’t get stuck showing stale information.
- [ ] Add a lightweight reverse-geocode helper (can hit OpenStreetMap/Nominatim or an internal endpoint if available) that converts `GeoPoint` from `useMealmapStore` into a readable neighborhood/building label. Cache the resolved string in the store so other surfaces (map, headers) can reuse it.
- [ ] Provide a manual “Set location” fallback (e.g., dialog linked to the badge) for users who block geolocation. Persist the chosen coordinates in `useMealmapStore` and feed them to `usePlaces` so backend queries always include real `lat`/`long` values instead of the current `0,0` defaults.

## ReviewFormPage + selectors – price input & endpoint wiring
- [x] Convert the “Price paid” control in `ReviewFormPage.tsx` from the slider at lines ~316–347 into a numeric/input-plus-currency widget so users can type the exact amount they paid. Keep validation aligned with the backend (`min ₩1,000`, optional upper bound) and reflect the chosen currency symbol from `ReviewCurrencySelector`.
- [x] When a user taps “Add new restaurant” inside `RestaurantSelector.tsx`, actually call `POST /places` (multipart per `docs/openapi.toon`) with `name`, `latitude`, `longitude`, optional `cuisine`, and staged photos. Use `useLocation` or the manual picker from above to prefill coordinates, then feed the returned place ID back into the form.
- [x] Replace the mock meal list in `MealSelector.tsx` with a query to `GET /meals?place_id=<id>` (and optional `name` search) so existing meals come from the backend. When the user adds a new meal, call `POST /meals` with `name`, `place_id`, and `price`, and keep the new meal ID in form state.
- [x] Track the selected meal’s backend ID alongside its name. If a reviewer updates the price for an existing meal, send that delta through `PUT /meals/{meal_id}` so the catalog stays accurate (“new way to update price for an existing meal”), then submit the review with `meal_id` instead of duplicating via `place_id` + `meal_name`.
- [x] Ensure the final `useCreateReview()` call posts a `FormData` payload to `POST /reviews` that always includes either `meal_id` or (`place_id` + `meal_name`) plus the typed `price` and uploaded images. After success invalidate `['places']`, `['meals', place_id]`, and `['reviews', meal_id]` queries so the feed/details views refresh.

## Restaurant details flow
- [x] Add a `/restaurants/:placeId` route in `src/app/routes.tsx` along with a dedicated page (e.g., `RestaurantDetailsPage.tsx`) that fetches `GET /places/{place_id}` for the hero card, `GET /meals?place_id=` for the meal list, and `GET /reviews?place_id=` for recent feedback.
- [x] Update `RestaurantCard.tsx` so the “View” button fires `navigate('/restaurants/<id>')` (pass `restaurant.id` through `RestaurantList` props). Keep keyboard accessibility (e.g., convert to `<Button asChild>` around a `<Link>` or wire up `onKeyDown`).
- [x] On the details page, render meals as an accordion/list where each meal row can expand to show its reviews or ratings breakdown. Reuse the dietary tags and upload gallery components so reviewers can quickly jump from the detail view straight into the submission form for that restaurant.

## Meal details flow
- [x] Introduce a `/meals/:mealId` route + page focused on a single dish: show price trends, dietary tags, wait-time history, and the full review feed filtered to that meal.
- [x] Wire the RestaurantDetailsPage accordion and any meal chips elsewhere so they deep-link into the meal details route (pass the selected meal context to the submission form as well).

## Recommendations & swipes
- [x] Replace the mock data in `useRecommendationsQuery` (`src/features/dashboard/data/hooks.ts`) with a real request to `GET /users/me/feed` so `RecommendationCard.tsx` displays live meals from the backend (`MealResponse` objects with `first_image.image_url`, `avg_rating`, `tags`, etc.). Update `MealRecommendation` typing or add a mapper to keep the UI props consistent.
- [x] When a user swipes or taps the like/dismiss buttons in `RecommendationsPage.tsx`, call `POST /swipes` with the required `{ meal_id, liked, session_id }`. Persist the swipe `session_id` in store (derive from feed response or request a new one) so subsequent swipes share the same session.
- [x] Handle pagination/pre-fetch: once only one or two cards remain, fetch another batch from `GET /users/me/feed?limit=…` and merge it into the deck so the experience never runs empty unless the API truly has no data.

## Additional items identified during review
- [ ] The feed currently renders a single page from `usePlaces` without pagination or “load more”. Implement cursor or page-based loading using the `Page<PlaceResponse>` metadata returned by `/places` (expose “Load older spots” button or infinite scroll) and pass `page` into the hook so users can browse beyond the first ten results.

## Priority order
1. RestaurantSearch.tsx – dynamic location
2. Additional items identified during review
