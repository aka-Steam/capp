# Достопримечательности

Основной список — **[content/attractions/places.md](../content/attractions/places.md)** (несколько мест в одном файле).

Можно вместо этого или дополнительно завести **отдельный** `.md` на место в `content/attractions/` — сайт подхватит любой файл в этой папке. В Obsidian открывается вся папка `content`, см. [content-format.md](./content-format.md).

## Формат блока в `places.md`

```markdown
---
id: unique-id
city: beijing
kind: attraction
title: "Название"
coords: [39.9, 116.4]
photos:
  - file: beijing/photo.jpg
    alt: Подпись
  - url: https://example.com/photo.jpg
    alt: Внешнее фото
---
Описание в Markdown (необязательно).

---
id: next-place
...
---
```

## Фото

| Способ | Пример |
|--------|--------|
| Локальный файл | `file: beijing/photo.jpg` → `public/images/attractions/beijing/photo.jpg` |
| Путь от корня сайта | `src: /images/attractions/beijing/photo.jpg` |
| Строка-путь | `photos: [beijing/photo.jpg]` |
| Внешняя ссылка | `url: https://...` |

## Добавить место

1. Новый блок `---` … `---` в `places.md` **или** новый файл `content/attractions/my-place.md` с одной записью.
2. Уникальный `id`, координаты с OpenStreetMap.
3. `npm run dev` — проверка.
