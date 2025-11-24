import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import type { PlaceBasicInfo } from '../../../types';
import { RestaurantList } from '../RestaurantList';
import { describe, expect, it, vi } from 'vitest';

const mockRestaurants: PlaceBasicInfo[] = [
  {
    id: 'test-bistro',
    name: 'Test Bistro',
    latitude: 36.37,
    longitude: 127.36,
    cuisine: 'Fusion',
    rating: 4.2,
    reviewCount: 128,
    priceRange: '$$',
    distance: '0.4 km',
    etaMinutes: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80',
    tags: ['Cozy', 'Small plates'],
    area: 'North quad',
    coordinates: { lat: 36.37, lng: 127.36 },
  },
  {
    id: 'lumen-cafe',
    name: 'Lumen Cafe',
    latitude: 36.36,
    longitude: 127.35,
    cuisine: 'Coffee',
    rating: 4.8,
    reviewCount: 289,
    priceRange: '$',
    distance: '0.2 km',
    etaMinutes: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    tags: ['Workspace', 'Bakery'],
    area: 'Campus hub',
    coordinates: { lat: 36.36, lng: 127.35 },
  },
];

describe('<RestaurantList />', () => {
  it('renders a card for each restaurant', () => {
    render(
      <MemoryRouter>
        <RestaurantList restaurants={mockRestaurants} />
      </MemoryRouter>
    );

    mockRestaurants.forEach((restaurant) => {
      expect(screen.getByText(restaurant.name)).toBeVisible();
      expect(screen.getByText(restaurant.cuisine!, { exact: false })).toBeVisible();
    });
  });

  it('invokes onBookmark when a restaurant is bookmarked', async () => {
    const user = userEvent.setup();
    const handleBookmark = vi.fn();
    render(
      <MemoryRouter>
        <RestaurantList restaurants={mockRestaurants} onBookmark={handleBookmark} />
      </MemoryRouter>
    );

    const bookmarkButtons = screen.getAllByRole('button', { name: /bookmark/i });
    await user.click(bookmarkButtons[0]);

    expect(handleBookmark).toHaveBeenCalledWith(mockRestaurants[0].id);
  });

  it('renders an empty state when no restaurants are available', () => {
    render(
      <MemoryRouter>
        <RestaurantList restaurants={[]} />
      </MemoryRouter>
    );

    expect(screen.getByText('No restaurants found')).toBeVisible();
    expect(screen.getByText(/Try updating your search or filters/i)).toBeVisible();
  });
});
