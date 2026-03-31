import { RestaurantSummary } from '@/types/restaurant';

export type RestaurantSortOption = 'distance' | 'accuracy';
export type RestaurantCategoryGroupCode = 'FD6' | 'CE7';

export type NearbyRestaurantsRequest = {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  page?: number;
  pageSize?: number;
  sort?: RestaurantSortOption;
  categoryGroupCode?: RestaurantCategoryGroupCode;
};

export type NearbyRestaurantsResponse = {
  meta: {
    source: 'kakao';
    totalCount: number;
    pageableCount: number;
    isEnd: boolean;
    page: number;
    pageSize: number;
    radiusMeters: number;
    sort: RestaurantSortOption;
    categoryGroupCode: RestaurantCategoryGroupCode;
    center: {
      latitude: number;
      longitude: number;
    };
  };
  items: RestaurantSummary[];
};
