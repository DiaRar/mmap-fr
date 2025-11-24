import type { GeoPoint } from '@/features/dashboard/types';

const NOMINATIM_REVERSE_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse';

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
  display_name?: string;
  address?: Address;
}

const SPECIFIC_FIELDS: Array<keyof Address> = [
  'shop',
  'restaurant',
  'cafe',
  'amenity',
  'office',
  'commercial',
];

const GENERIC_FIELDS: Array<keyof Address> = [
  'building',
  'public_building',
  'campus',
  'university',
  'name',
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
    return `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`;
  }

  const address = payload.address;
  const pick = (fields: Array<keyof Address>) =>
    fields
      .map((field) => address?.[field])
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .find((value) => value.length > 0);

  const specific = pick(SPECIFIC_FIELDS);
  if (specific) return specific;

  const displayPrimary = payload.display_name?.split(',')[0]?.trim();
  if (displayPrimary) return displayPrimary;

  const generic = pick(GENERIC_FIELDS);
  if (generic) return generic;

  const street = formatStreet(address);
  if (street) return street;

  return `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`;
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
