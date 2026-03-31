import { RestaurantSummary } from '@/types/restaurant';

export type MapRestaurant = RestaurantSummary & {
  summary: string;
  etaLabel: string;
  mapTop: string;
  mapLeft: string;
  highlighted?: boolean;
};
