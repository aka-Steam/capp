import { z } from 'zod';

/** JSON often uses `null` for missing values — treat as omitted. */
function stripNulls(value: unknown): unknown {
  if (value === null) return undefined;
  if (Array.isArray(value)) return value.map(stripNulls);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const stripped = stripNulls(nested);
      if (stripped !== undefined) out[key] = stripped;
    }
    return out;
  }
  return value;
}

const nullishObject = <T extends z.ZodType>(schema: T) =>
  z.preprocess(stripNulls, schema);

export const categorySchema = z.enum([
  'attraction',
  'restaurant',
  'cafe',
  'shop',
  'hotel',
  'station',
  'airport',
  'meeting_point',
]);

export const poiCategorySchema = z.enum([
  'attraction',
  'restaurant',
  'cafe',
  'shop',
  'station',
  'airport',
  'meeting_point',
]);

const attractionKindSchema = z.enum([
  'museum',
  'palace',
  'temple',
  'wall-section',
  'mountain',
  'park',
  'scenic-area',
  'market',
  'historical-site',
]);

const themeSchema = z.enum([
  'culture',
  'history',
  'scenic',
  'adventure',
  'wellness',
  'food',
  'shopping',
  'nightlife',
]);

const coordinatesSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  source: z.enum(['google', 'yandex', 'osm']).optional(),
  system: z.enum(['wgs84', 'gcj02', 'bd09']).optional(),
});

const geoSchema = z.preprocess((val) => {
  if (!val || typeof val !== 'object') return undefined;
  const geo = val as Record<string, unknown>;
  if (typeof geo.lat !== 'number' || typeof geo.lon !== 'number') return undefined;
  return geo;
}, coordinatesSchema.optional());

const mediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video']),
  src: z.string(),
  preview: z.string().optional(),
  caption: z.string().optional(),
  sourceUrl: z.string().optional(),
});

const priceSchema = z.object({
  amount: z.number(),
  currency: z.enum(['CNY', 'RUB', 'USD', 'EUR']),
  timeframe: z.string().optional(),
  approximate: z.boolean().optional(),
});

export const linkSchema = z.object({
  label: z.string(),
  url: z.string().min(1),
});

const visitSchema = z.object({
  durationMin: z.number().optional(),
  openingHours: z.string().optional(),
  price: priceSchema.optional(),
  bookingRequired: z.boolean().optional(),
  notes: z.string().optional(),
});

const locationSchema = z.object({
  geo: geoSchema,
  cityId: z.string().optional(),
  province: z.string().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
});

const poiCore = {
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  kind: attractionKindSchema.optional(),
  theme: themeSchema.optional(),
  location: locationSchema,
  visit: visitSchema.optional(),
  media: z.array(mediaItemSchema).default([]),
  links: z.array(linkSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  verified: z.boolean(),
};

export const poiSchema = nullishObject(
  z.object({
    ...poiCore,
    category: poiCategorySchema,
  }),
);

export const staySchema = z.object({
  priceSingle: z.number().optional(),
  priceDouble: z.number().optional(),
  hasSingleRoom: z.boolean().optional(),
  currency: z.enum(['CNY', 'RUB', 'USD', 'EUR']).optional(),
  nearbyWalkable: z
    .array(
      z.object({
        ref: z.string(),
        walkMinutes: z.number().min(1).max(35),
      }),
    )
    .optional(),
});

export const hotelSchema = nullishObject(
  z.object({
    ...poiCore,
    category: z.literal('hotel'),
    stay: staySchema.optional(),
  }),
);

export const logisticsTypeSchema = z.enum(['flight', 'train', 'bus', 'metro', 'taxi']);

export const logisticsSchema = nullishObject(
  z.object({
    id: z.string(),
    type: logisticsTypeSchema,
    from: z.string(),
    to: z.string(),
    duration: z.string().optional(),
    cost: z.string().optional(),
    notes: z.string().optional(),
    description: z.string().optional(),
    bookingLinks: z.array(linkSchema).optional(),
  }),
);

export const scheduleEventKind = z.enum([
  'flight',
  'train',
  'bus',
  'metro',
  'taxi',
  'visit',
  'shop',
  'food',
  'hotel',
  'free',
]);
