<script lang="ts">
  import '../styles/schedule-grid.css';
  import {
    refHref,
    scheduleKindLabels,
    type ScheduleEventKind,
  } from '../lib/schedule';

  interface ScheduleEvent {
    start: string;
    end: string;
    title: string;
    kind?: ScheduleEventKind;
    ref?: string;
    pack?: string[];
  }

  interface ScheduleDay {
    date: string;
    label: string;
    events: ScheduleEvent[];
  }

  interface Props {
    days: ScheduleDay[];
    baseUrl: string;
  }

  let { days, baseUrl }: Props = $props();

  const HOUR_PX = 24;
  const GRID_HEIGHT = 24 * HOUR_PX;

  const legendKinds: ScheduleEventKind[] = [
    'flight',
    'train',
    'bus',
    'visit',
    'food',
    'hotel',
    'free',
  ];

  function parseMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  }

  function eventStyle(start: string, end: string): string {
    const startMin = parseMinutes(start);
    const endMin = parseMinutes(end);
    const top = (startMin / 1440) * GRID_HEIGHT;
    const height = Math.max(((endMin - startMin) / 1440) * GRID_HEIGHT, 20);
    return `top:${top}px;height:${height}px`;
  }

  function eventKind(ev: ScheduleEvent): ScheduleEventKind {
    return ev.kind ?? 'visit';
  }
</script>

<div class="schedule-legend" aria-label="Типы событий">
  {#each legendKinds as kind}
    <span class="schedule-legend__item">
      <span class="schedule-legend__swatch schedule-event--{kind}"></span>
      {scheduleKindLabels[kind]}
    </span>
  {/each}
</div>

<div class="schedule-page">
  <div class="schedule-grid-wrap">
    <div class="schedule-grid" role="grid" aria-label="Расписание по дням">
      {#each days as day (day.date)}
        <div class="schedule-day">
          <div class="schedule-day__header">{day.label}</div>
          <div class="schedule-day__grid" style={`height:${GRID_HEIGHT}px`}>
            {#each Array.from({ length: 24 }, (_, i) => i) as hour}
              <div class="schedule-hour">{String(hour).padStart(2, '0')}:00</div>
            {/each}
            {#each day.events as ev}
              {@const kind = eventKind(ev)}
              {@const href = refHref(baseUrl, kind, ev.ref)}
              <div
                class="schedule-event schedule-event--{kind}"
                style={eventStyle(ev.start, ev.end)}
                title={scheduleKindLabels[kind]}
              >
                <div class="schedule-event__time">{ev.start} – {ev.end}</div>
                <strong>{ev.title}</strong>
                {#if href}
                  <div>
                    <a href={href}>Справочник</a>
                  </div>
                {/if}
                {#if ev.pack?.length}
                  <ul class="schedule-event__pack">
                    {#each ev.pack as item}
                      <li>{item}</li>
                    {/each}
                  </ul>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .schedule-day__grid {
    position: relative;
  }

  .schedule-hour {
    position: relative;
    z-index: 0;
  }
</style>
