export type RestaurantSortOption = 'distance' | 'reviewCount' | 'rating';

export type RestaurantSummary = {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress?: string | null;
  phone?: string | null;
  placeUrl?: string | null;
  distanceMeters?: number | null;
  reviewCount?: number | null;
  rating?: number | null;
  latitude: number;
  longitude: number;
};
