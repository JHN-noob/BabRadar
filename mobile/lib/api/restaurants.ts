import {
  type NearbyRestaurantsRequest,
  type NearbyRestaurantsResponse,
} from '@/types/nearby-restaurants';

export async function fetchNearbyRestaurants(
  request: NearbyRestaurantsRequest,
  options?: { signal?: AbortSignal }
) {
  const baseUrl = getServerBaseUrl();
  const searchParams = new URLSearchParams({
    latitude: String(request.latitude),
    longitude: String(request.longitude),
  });

  if (request.radiusMeters !== undefined) {
    searchParams.set('radiusMeters', String(request.radiusMeters));
  }

  if (request.page !== undefined) {
    searchParams.set('page', String(request.page));
  }

  if (request.pageSize !== undefined) {
    searchParams.set('pageSize', String(request.pageSize));
  }

  if (request.sort) {
    searchParams.set('sort', request.sort);
  }

  if (request.categoryGroupCode) {
    searchParams.set('categoryGroupCode', request.categoryGroupCode);
  }

  const response = await fetch(`${baseUrl}/api/restaurants/nearby?${searchParams.toString()}`, {
    signal: options?.signal,
  });

  if (!response.ok) {
    const errorBody = await safeReadErrorBody(response);
    throw new Error(errorBody ?? `Nearby restaurants request failed (${response.status}).`);
  }

  return (await response.json()) as NearbyRestaurantsResponse;
}

function getServerBaseUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_SERVER_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_SERVER_BASE_URL is not configured.');
  }

  return baseUrl.replace(/\/$/, '');
}

async function safeReadErrorBody(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error;
  } catch {
    return null;
  }
}
