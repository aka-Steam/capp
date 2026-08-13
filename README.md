# Поездка в Китай — справочник и расписание

Статический сайт на [Astro](https://astro.build) + [Svelte](https://svelte.dev) для планирования поездки. Данные хранятся в JSON в папке `database/` — сайт только отображает их.

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте адрес из терминала (обычно http://localhost:4321).

## Структура данных

| Файл / папка | Содержимое |
|--------------|------------|
| `database/poi.json` | Места: достопримечательности, магазины, кафе, рестораны |
| `database/media/` | Локальные фото и видео (`src: "/media/имя-файла"`) |
| `database/hotels.json` | Отели (`category: "hotel"` + опциональный блок `stay`) |
| `database/logistics.json` | Перелёты, поезда, автобусы, метро, такси |
| `content/schedules/*.yaml` | Расписание |
| `config/navigation.yaml` | Пункты бокового меню |
| `config/map.yaml` | Тайлы Leaflet |
| `public/leaflet/` | Self-hosted Leaflet |
| `public/leaflet-measure/` | Линейка расстояний |

Модель места — `IPoi` в `src/types.ts`. Отель — `IHotel` (тот же POI + `stay`: цены, `hasSingleRoom`, `nearbyWalkable`).

## Страницы

- `/map` — карта всех точек, панель справа по клику на маркер
- `/points` — список мест с фильтрами по категории и городу
- `/poi/[id]` — карточка места
- `/hotels` — сравнение отелей с калькулятором ночей
- `/logistics` — маршруты
- `/schedule/demo` — расписание

Старые URL `/attractions` и `/food` перенаправляют на `/points`.

## Сборка

```bash
npm run build
npm run preview
```

## Деплой

### GitHub Pages

1. Репозиторий → Settings → Pages → Source: **GitHub Actions**.
2. Variables (Settings → Secrets and variables → Actions):
   - `SITE_BASE` = `/имя-репозитория/` для project site или `/` для user site.
   - `SITE_URL` = полный URL сайта.
3. Push в `main` — workflow `.github/workflows/deploy.yml` соберёт и опубликует `dist/`.

### Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Environment: `SITE_BASE=/`, `SITE_URL=https://ваш-домен.vercel.app`

### GitVerse Pages

Аналогично GitHub Pages: статический артефакт `dist`, при необходимости задайте `SITE_BASE` под путь проекта.

## Карта

Используются [Leaflet](https://leafletjs.com/) и тайлы OpenStreetMap. URL тайлов — в `config/map.yaml`. Библиотека лежит в `public/leaflet/` (без внешнего CDN). На карте есть линейка расстояний (`leaflet-measure`).

Координаты берите с [openstreetmap.org](https://www.openstreetmap.org/) — китайские карты могут использовать смещение GCJ-02. В данных поле `location.geo.system` может быть `wgs84`, `gcj02` или `bd09`.
