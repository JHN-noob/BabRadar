import { NextRequest, NextResponse } from 'next/server';

import { fetchNearbyRestaurants } from '@/services/kakao/nearby-restaurants';
import {
  type NearbyRestaurantsRequest,
  type RestaurantCategoryGroupCode,
  type RestaurantSortOption,
} from '@/types/restaurants';

const CATEGORY_GROUP_CODES = new Set<RestaurantCategoryGroupCode>(['FD6', 'CE7']);
const SORT_OPTIONS = new Set<RestaurantSortOption>(['distance', 'accuracy']);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = parseRequiredNumber(searchParams.get('latitude'));
  const longitude = parseRequiredNumber(searchParams.get('longitude'));

  if (latitude === null || longitude === null) {
    return NextResponse.json(
      {
        error: 'latitude and longitude query parameters are required numbers.',
      },
      { status: 400 }
    );
  }

  const nearbyRequest: NearbyRestaurantsRequest = {
    latitude,
    longitude,
    radiusMeters: parseOptionalNumber(searchParams.get('radiusMeters')),
    page: parseOptionalNumber(searchParams.get('page')),
    pageSize: parseOptionalNumber(searchParams.get('pageSize')),
    sort: parseSortOption(searchParams.get('sort')),
    categoryGroupCode: parseCategoryGroupCode(searchParams.get('categoryGroupCode')),
  };

  try {
    const response = await fetchNearbyRestaurants(nearbyRequest);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    const status = message.includes('KAKAO_REST_API_KEY') ? 503 : 502;

    return NextResponse.json(
      {
        error: message,
      },
      { status }
    );
  }
}

function parseRequiredNumber(value: string | null) {
  if (value === null) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function parseOptionalNumber(value: string | null) {
  if (value === null || value.length === 0) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function parseSortOption(value: string | null) {
  if (!value || !SORT_OPTIONS.has(value as RestaurantSortOption)) {
    return undefined;
  }

  return value as RestaurantSortOption;
}

function parseCategoryGroupCode(value: string | null) {
  if (!value || !CATEGORY_GROUP_CODES.has(value as RestaurantCategoryGroupCode)) {
    return undefined;
  }

  return value as RestaurantCategoryGroupCode;
}
