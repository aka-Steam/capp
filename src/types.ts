export type Category =
  | 'attraction'
  | 'restaurant'
  | 'cafe'
  | 'shop'
  | 'hotel'
  | 'station'
  | 'airport'
  | 'meeting_point';

export type AttractionKind =
  | 'museum'
  | 'palace'
  | 'temple'
  | 'wall-section'
  | 'mountain'
  | 'park'
  | 'scenic-area'
  | 'market'
  | 'historical-site';

export type Theme =
  | 'culture'
  | 'history'
  | 'scenic'
  | 'adventure'
  | 'wellness'
  | 'food'
  | 'shopping'
  | 'nightlife';

export type Coordinates = {
  lat: number;
  lon: number;
  source?: 'google' | 'yandex';
  system?: 'wgs84' | 'gcj02' | 'bd09';
};

export type MediaItem = {
  id: string;
  type: 'image' | 'video';
  src: string;
  preview?: string;
  caption?: string;
  sourceUrl?: string;
};

export type Price = {
  amount: number;
  currency: 'CNY' | 'RUB' | 'USD' | 'EUR';
  timeframe?: string;
  approximate?: boolean;
};

export type Link = {
  label: string;
  url: string;
};

export type Stay = {
  priceSingle?: number;
  priceDouble?: number;
  hasSingleRoom?: boolean;
  currency?: 'CNY' | 'RUB' | 'USD' | 'EUR';
  nearbyWalkable?: { ref: string; walkMinutes: number }[];
};

/**
 * Point of Interest
 */
export interface IPoi {
  id: string;
  title: string;
  description?: string;
  category: Category;
  kind?: AttractionKind;
  theme?: Theme;
  location: {
    geo?: Coordinates;
    cityId?: string;
    province?: string;
    address?: string;
    district?: string;
  };
  visit?: {
    durationMin?: number;
    openingHours?: string | '24/7';
    price?: Price;
    bookingRequired?: boolean;
    notes?: string;
  };
  media: MediaItem[];
  links: Link[];
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

export interface IHotel extends Omit<IPoi, 'category'> {
  category: 'hotel';
  stay?: Stay;
}

export type LogisticsType = 'flight' | 'train' | 'bus' | 'metro' | 'taxi';

export interface ILogistics {
  id: string;
  type: LogisticsType;
  from: string;
  to: string;
  duration?: string;
  cost?: string;
  notes?: string;
  description?: string;
  bookingLinks?: Link[];
}
