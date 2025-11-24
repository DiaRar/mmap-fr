import type { GeoPoint } from '@/features/dashboard/types';

const NOMINATIM_REVERSE_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse';
const MAX_LABEL_LENGTH = 32;

type Address = {
  name?: string;
  amenity?: string;
  shop?: string;
  restaurant?: string;
  cafe?: string;
  office?: string;
  building?: string;
  public_building?: string;
  commercial?: string;
  house_number?: string;
  road?: string;
  residential?: string;
  pedestrian?: string;
  footway?: string;
  path?: string;
  cycleway?: string;
  neighbourhood?: string;
  suburb?: string;
  city_district?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  campus?: string;
  university?: string;
};

interface NominatimReverseResponse {
  name?: string;
  display_name?: string;
  address?: Address;
}

const BUILDING_FIELDS: Array<keyof Address> = [
  'building',
  'public_building',
  'commercial',
  'campus',
  'university',
  'office',
];

const STREET_FIELDS: Array<keyof Address> = [
  'road',
  'residential',
  'pedestrian',
  'footway',
  'path',
  'cycleway',
];

function formatStreet(address?: Address | null) {
  if (!address) return null;
  const segment = STREET_FIELDS.map((field) => address[field])
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .find((value) => value.length > 0);

  if (!segment && !address.house_number) return null;

  return [segment, address.house_number].filter(Boolean).join(' ').trim();
}

function buildLabel(payload: NominatimReverseResponse, coords: GeoPoint): string {
  if (!payload) {
    return formatFallback(coords);
  }

  const name = payload.name?.trim();
  if (name) {
    return truncateLabel(name);
  }

  const address = payload.address;
  const building = BUILDING_FIELDS.map((field) => address?.[field])
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .find((value) => value.length > 0);
  if (building) {
    return truncateLabel(building);
  }

  const displayPrimary = payload.display_name?.split(',')[0]?.trim();
  if (displayPrimary) {
    return truncateLabel(displayPrimary);
  }

  const street = formatStreet(address);
  if (street) {
    return truncateLabel(street);
  }

  return formatFallback(coords);
}

export async function reverseGeocode(point: GeoPoint): Promise<string> {
  const params = new URLSearchParams({
    lat: point.lat.toString(),
    lon: point.lng.toString(),
    format: 'jsonv2',
    addressdetails: '1',
    zoom: '18',
    email: 'dev-support@mealmap.app',
  });

  const response = await fetch(`${NOMINATIM_REVERSE_ENDPOINT}?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to resolve your location');
  }

  const data = (await response.json()) as NominatimReverseResponse;
  return buildLabel(data, point);
}

function truncateLabel(label: string): string {
  if (label.length <= MAX_LABEL_LENGTH) {
    return label;
  }
  return `${label.slice(0, MAX_LABEL_LENGTH - 3).trimEnd()}...`;
}

function formatFallback(coords: GeoPoint): string {
  const fallback = `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`;
  return truncateLabel(fallback);
}
