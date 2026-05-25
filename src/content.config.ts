import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { hybridMarkdownLoader } from './loaders/hybridMarkdown';

const cityEnum = z.enum(['beijing', 'shanghai', 'pingyao']);
const coordsSchema = z.tuple([z.number(), z.number()]);

const photoItemSchema = z.union([
  z.string(),
  z.object({
    file: z.string().optional(),
    src: z.string().optional(),
    url: z.string().url().optional(),
    alt: z.string().optional(),
  }),
]);

const linkSchema = z.object({
  label: z.string(),
  url: z.string().url(),
});

/** Число или пусто / «-» в YAML (для цен отелей). */
const optionalPrice = z.preprocess((val) => {
  if (val === '-' || val === '' || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}, z.number().optional());

const placeCore = {
  id: z.string(),
  city: cityEnum,
  title: z.string(),
  coords: coordsSchema,
};

const attractions = defineCollection({
  loader: hybridMarkdownLoader({ base: './content/attractions' }),
  schema: z
    .object({
      ...placeCore,
      kind: z.enum(['attraction', 'shop']).default('attraction'),
      district: z.string().optional(),
      address: z.string().optional(),
      photos: z.array(photoItemSchema).optional(),
      hours: z.string().optional(),
      cost: z.string().optional(),
      // rating: z.number().min(0).max(5).optional(),
      links: z.array(linkSchema).optional(),
    })
    .passthrough(),
});

const hotels = defineCollection({
  loader: hybridMarkdownLoader({ base: './content/hotels' }),
  schema: z
    .object({
      ...placeCore,
      district: z.string().optional(),
      address: z.string().optional(),
      photos: z.array(photoItemSchema).optional(),
      priceSingle: optionalPrice,
      priceDouble: optionalPrice,
      hasSingleRoom: z.boolean().optional(),
      currency: z.string().default('CNY'),
      bookingLinks: z.array(linkSchema).optional(),
      nearbyWalkable: z
        .array(
          z.object({
            ref: z.string(),
            walkMinutes: z.number().min(1).max(35),
          }),
        )
        .optional(),
    })
    .passthrough(),
});

const food = defineCollection({
  loader: hybridMarkdownLoader({ base: './content/food' }),
  schema: z
    .object({
      ...placeCore,
      category: z.enum(['chinese_must_try', 'familiar_russian']),
      district: z.string().optional(),
      address: z.string().optional(),
      photos: z.array(photoItemSchema).optional(),
      nearPlaces: z.array(z.string()).optional(),
      cost: z.string().optional(),
    })
    .passthrough(),
});

const logistics = defineCollection({
  loader: hybridMarkdownLoader({
    base: './content/logistics',
    inferLogisticsTypeFromFile: true,
  }),
  schema: z
    .object({
      id: z.string(),
      type: z.enum(['flight', 'train', 'bus', 'metro', 'taxi']),
      from: z.string(),
      to: z.string(),
      duration: z.string().optional(),
      cost: z.string().optional(),
      notes: z.string().optional(),
      bookingLinks: z.array(linkSchema).optional(),
    })
    .passthrough(),
});

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

const schedules = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './content/schedules' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    days: z.array(
      z.object({
        date: z.coerce.date(),
        events: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
              title: z.string(),
              kind: scheduleEventKind.default('visit'),
              ref: z.string().optional(),
              pack: z.array(z.string()).optional(),
            }),
          )
          .default([]),
      }),
    ),
  }),
});

export const collections = {
  attractions,
  hotels,
  food,
  logistics,
  schedules,
};
