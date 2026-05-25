# Формат файлов контента

Сайт читает **все** `*.md` в папке раздела. Один файл может содержать **несколько записей** (bundle) или **одну**.

## Obsidian

Откройте папку **`content`** как vault в Obsidian (File → Open folder as vault). Вы редактируете **те же файлы**, из которых собирается сайт: `attractions/places.md`, `food/beijing.md`, `logistics/trains.md` и т.д. Отдельная служебная папка не нужна.

После правок: `npm run dev` локально или `git push` для обновления сайта.

## Синтаксис записи

```markdown
---
id: unique-id
# …поля…
---

Текст заметки (Markdown), необязательно.

---
id: next-entry
---
```

Несколько записей в одном файле — блоки подряд, между записями строка `---` с новой строки.

## Если один и тот же `id` в двух файлах

Сначала загружаются файлы **ближе к корню** папки раздела (`places.md`, `beijing.md`), затем файлы **в подпапках**. Запись из более глубокого пути заменяет ту же `id`. Это только на случай, если вы намеренно дублируете id (обычно достаточно одного файла).

## Структура по разделам

| Раздел | Файлы |
|--------|--------|
| Достопримечательности | `attractions/places.md` (все места) или отдельные `.md` в `attractions/` |
| Еда | `food/beijing.md`, `food/shanghai.md` |
| Отели | `hotels/beijing.md`, `hotels/shanghai.md` — несколько отелей; `hasSingleRoom: false` если нет одноместных; `nearbyWalkable` — достопримечательности пешком до 35 мин (`ref` + `walkMinutes`) |
| Логистика | `logistics/flights.md`, `trains.md`, `buses.md`, `metro.md`, `taxi.md` |

### Логистика: тип по имени файла

| Файл | Тип |
|------|-----|
| `flights.md` | авиа |
| `trains.md` | поезд |
| `buses.md` | автобус |
| `metro.md` | метро |
| `taxi.md` | такси |

Поле `type:` в записи можно не указывать — подставится из имени файла.

```yaml
id: bus-pek-mutianyu
from: "Dongzhimen"
to: "Мутяньюй"
duration: "~1 ч"
cost: "¥12–20"
notes: "Автобус 916"
bookingLinks:
  - label: "Trip.com"
    url: "https://www.trip.com"
```

### Фото

См. [attractions-bundle.md](./attractions-bundle.md).
