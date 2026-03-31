import { mockMapRestaurants } from '@/features/map/data/mock-map-restaurants';
import { MapRestaurant } from '@/features/map/types/map-restaurant';
import { RestaurantSummary } from '@/types/restaurant';

const markerSlots = [
  { top: '32%', left: '58%' },
  { top: '22%', left: '38%' },
  { top: '44%', left: '28%' },
  { top: '54%', left: '66%' },
  { top: '30%', left: '74%' },
  { top: '60%', left: '34%' },
] as const;

export function getMockMapRestaurants() {
  return mockMapRestaurants;
}

export function toMapRestaurants(restaurants: RestaurantSummary[]): MapRestaurant[] {
  return restaurants.map((restaurant, index) => {
    const markerSlot = markerSlots[index % markerSlots.length];

    return {
      ...restaurant,
      summary: buildSummary(restaurant),
      etaLabel: buildEtaLabel(restaurant.distanceMeters),
      mapTop: markerSlot.top,
      mapLeft: markerSlot.left,
      highlighted: index === 0,
    };
  });
}

function buildSummary(restaurant: RestaurantSummary) {
  const roadAddress = restaurant.roadAddress ?? restaurant.address;

  if (restaurant.distanceMeters !== null && restaurant.distanceMeters !== undefined) {
    return `${roadAddress} 근처에서 ${restaurant.distanceMeters}m 거리의 후보입니다.`;
  }

  return `${roadAddress} 근처 음식점 후보입니다.`;
}

function buildEtaLabel(distanceMeters?: number | null) {
  if (distanceMeters === null || distanceMeters === undefined) {
    return '거리 정보 없음';
  }

  const walkingMinutes = Math.max(1, Math.round(distanceMeters / 70));
  return `도보 ${walkingMinutes}분`;
}
