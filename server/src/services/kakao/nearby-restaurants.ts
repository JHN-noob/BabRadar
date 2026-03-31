import {
  type NearbyRestaurantsRequest,
  type NearbyRestaurantsResponse,
  type RestaurantCategoryGroupCode,
  type RestaurantSortOption,
  type RestaurantSummary,
} from '@/types/restaurants';

const KAKAO_CATEGORY_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/category.json';

type KakaoCategorySearchResponse = {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoCategoryDocument[];
};

type KakaoCategoryDocument = {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  distance?: string;
  x: string;
  y: string;
};

type NormalizedNearbyRestaurantsRequest = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  page: number;
  pageSize: number;
  sort: RestaurantSortOption;
  categoryGroupCode: RestaurantCategoryGroupCode;
};

export async function fetchNearbyRestaurants(
  request: NearbyRestaurantsRequest
): Promise<NearbyRestaurantsResponse> {
  const normalizedRequest = normalizeNearbyRestaurantsRequest(request);
  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    throw new Error('KAKAO_REST_API_KEY is not configured.');
  }

  const searchParams = new URLSearchParams({
    category_group_code: normalizedRequest.categoryGroupCode,
    x: String(normalizedRequest.longitude),
    y: String(normalizedRequest.latitude),
    radius: String(normalizedRequest.radiusMeters),
    page: String(normalizedRequest.page),
    size: String(normalizedRequest.pageSize),
    sort: normalizedRequest.sort,
  });

  const response = await fetch(`${KAKAO_CATEGORY_SEARCH_URL}?${searchParams.toString()}`, {
    headers: {
      Authorization: `KakaoAK ${apiKey}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(`Kakao Local API request failed (${response.status}): ${errorBody}`);
  }

  const payload = (await response.json()) as KakaoCategorySearchResponse;

  return {
    meta: {
      source: 'kakao',
      totalCount: payload.meta.total_count,
      pageableCount: payload.meta.pageable_count,
      isEnd: payload.meta.is_end,
      page: normalizedRequest.page,
      pageSize: normalizedRequest.pageSize,
      radiusMeters: normalizedRequest.radiusMeters,
      sort: normalizedRequest.sort,
      categoryGroupCode: normalizedRequest.categoryGroupCode,
      center: {
        latitude: normalizedRequest.latitude,
        longitude: normalizedRequest.longitude,
      },
    },
    items: payload.documents.map(normalizeKakaoDocument),
  };
}

function normalizeNearbyRestaurantsRequest(
  request: NearbyRestaurantsRequest
): NormalizedNearbyRestaurantsRequest {
  return {
    latitude: clamp(request.latitude, -90, 90),
    longitude: clamp(request.longitude, -180, 180),
    radiusMeters: clampInteger(request.radiusMeters ?? 1200, 0, 20000),
    page: clampInteger(request.page ?? 1, 1, 45),
    pageSize: clampInteger(request.pageSize ?? 15, 1, 15),
    sort: request.sort ?? 'distance',
    categoryGroupCode: request.categoryGroupCode ?? 'FD6',
  };
}

function normalizeKakaoDocument(document: KakaoCategoryDocument): RestaurantSummary {
  return {
    id: document.id,
    name: document.place_name,
    category: document.category_name,
    address: document.address_name,
    roadAddress: emptyToNull(document.road_address_name),
    phone: emptyToNull(document.phone),
    placeUrl: emptyToNull(document.place_url),
    distanceMeters: parseNumberOrNull(document.distance),
    reviewCount: null,
    rating: null,
    latitude: Number(document.y),
    longitude: Number(document.x),
  };
}

function emptyToNull(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function parseNumberOrNull(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampInteger(value: number, min: number, max: number) {
  return Math.round(clamp(value, min, max));
}
