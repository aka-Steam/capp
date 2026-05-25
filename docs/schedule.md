# Расписание

Файлы: `content/schedules/*.yaml`.

```yaml
title: "Мой маршрут"
slug: demo
days:
  - date: 2026-11-01
    events:
      - start: "08:00"
        end: "12:30"
        kind: visit
        title: "Запретный город"
        ref: forbidden-city
        pack: ["паспорт", "вода"]
  - date: 2026-11-02
    events: []
```

## Поле `kind` (тип и цвет)

| kind | Цвет | Ссылка `ref` ведёт в |
|------|------|----------------------|
| `flight` | синий | Логистика |
| `train` | фиолетовый | Логистика |
| `bus` | бирюзовый | Логистика |
| `metro` | голубой | Логистика |
| `taxi` | жёлтый | Логистика |
| `visit` | красный (акцент) | Достопримечательности |
| `shop` | розовый | Достопримечательности |
| `food` | оранжевый | Еда |
| `hotel` | индиго | Отели |
| `free` | серый | без ссылки |

Если `kind` не указан — считается `visit`.

`ref` — `id` записи в соответствующем разделе (`great-wall-mutianyu`, `train-beijing-shanghai`, …).

## Новый маршрут

1. Файл `content/schedules/my-trip.yaml` с уникальным `slug`.
2. Пункт в `config/navigation.yaml`: `href: /schedule/my-trip`.
