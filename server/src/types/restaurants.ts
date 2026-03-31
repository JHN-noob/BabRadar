export type RestaurantSortOption = 'distance' | 'accuracy';

export type RestaurantCategoryGroupCode = 'FD6' | 'CE7';

export type RestaurantSummary = {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string | null;
  phone: string | null;
  placeUrl: string | null;
  distanceMeters: number | null;
  reviewCount: number | null;
  rating: number | null;
  latitude: number;
  longitude: number;
};

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
