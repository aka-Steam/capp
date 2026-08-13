import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { jsonArrayLoader } from './loaders/jsonArray';
import { hotelSchema, logisticsSchema, poiSchema, scheduleEventKind } from './lib/schemas';

const poi = defineCollection({
  loader: jsonArrayLoader({ file: './database/poi.json' }),
  schema: poiSchema,
});

const hotels = defineCollection({
  loader: jsonArrayLoader({ file: './database/hotels.json' }),
  schema: hotelSchema,
});

const logistics = defineCollection({
  loader: jsonArrayLoader({ file: './database/logistics.json' }),
  schema: logisticsSchema,
});

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

export { scheduleEventKind };

export const collections = {
  poi,
  hotels,
  logistics,
  schedules,
};
