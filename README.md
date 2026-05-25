# Поездка в Китай — справочник и расписание

Статический сайт на [Astro](https://astro.build) + [Svelte](https://svelte.dev) для планирования поездки. Данные хранятся в Markdown/YAML в папке `content/` — сайт только отображает их.

## Obsidian

Откройте папку **`content`** как vault (не отдельную подпапку). Редактируйте `attractions/places.md`, `food/beijing.md`, `logistics/trains.md` и т.д. — это те же файлы, что использует сайт.

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте адрес из терминала (обычно http://localhost:4321).

## Структура данных

| Папка | Содержимое |
|-------|------------|
| `content/` | **Vault для Obsidian** — те же файлы, что читает сайт ([формат](docs/content-format.md)) |
| `content/attractions/places.md` | Достопримечательности (bundle) |
| `content/food/beijing.md`, `shanghai.md` | Вся еда города в одном файле |
| `content/hotels/beijing.md`, `shanghai.md` | Несколько отелей на выбор |
| `content/logistics/trains.md`, `buses.md`, … | Маршруты по типу транспорта |
| `content/schedules/*.yaml` | Расписание ([формат](docs/schedule.md)) |
| `public/images/` | Локальные фото |
| `content/hotels/` | Отели |
| `content/food/` | Еда |
| `content/logistics/` | Перелёты, поезда и т.д. |
| `content/schedules/` | Варианты расписания (YAML) |
| `config/fields/` | Какие поля показывать на карточках |
| `config/navigation.yaml` | Пункты бокового меню |

Как добавить поле — [docs/adding-a-field.md](docs/adding-a-field.md).

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

Используются [Leaflet](https://leafletjs.com/) и тайлы OpenStreetMap. URL тайлов — в `config/map.yaml`. Библиотека лежит в `public/leaflet/` (без внешнего CDN).

Координаты берите с [openstreetmap.org](https://www.openstreetmap.org/) — китайские карты могут использовать смещение GCJ-02.

## Новый раздел меню

1. Запись в `config/navigation.yaml`.
2. Коллекция в `src/content.config.ts` + папка `content/<раздел>/`.
3. `config/fields/<раздел>.yaml`.
4. Страница `src/pages/<раздел>/index.astro` (скопируйте с `attractions` или `logistics`).
