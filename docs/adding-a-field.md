# Как добавить новое поле в справочник

Пример: поле `tags` у достопримечательностей.

## 1. Данные

В frontmatter блока в `content/attractions/places.md` (или в `.md` отелей/еды):

```yaml
tags: [семья, на-полдня]
```

## 2. Отображение

В `config/fields/attractions.yaml`:

```yaml
tags:
  label: Теги
  type: tags
  showOnCard: true
```

Типы виджетов: `text`, `stars`, `url`, `money`, `enum`, `links`, `tags`.

Новый тип виджета — добавьте обработку в `src/lib/fieldRows.ts` (функция `formatRowValue`) и при необходимости в `src/components/FieldRenderer.astro`.

## 3. Валидация (опционально)

В `src/content.config.ts` для коллекции:

```ts
tags: z.array(z.string()).optional(),
```

Если поле не добавить в Zod, оно всё равно сохранится благодаря `.passthrough()` на схеме.

## 4. Сборка

```bash
npm run build
```

Ошибки Zod укажут на неверный тип в конкретном файле.

## Переименование поля

1. Замените ключ во всех `.md` файлах.
2. Обновите `config/fields/*.yaml`.
3. Обновите Zod в `content.config.ts`, если поле там объявлено.
