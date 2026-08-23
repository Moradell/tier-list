# Архитектура

Проект использует прагматичный Feature-Sliced Design.

## Слои

```text
app → pages → widgets → features → entities → shared
```

- `app` — providers, router, глобальные layout и стили.
- `pages` — компоненты, соответствующие URL.
- `widgets` — крупные композиционные блоки страницы.
- `features` — завершённые действия пользователя.
- `entities` — бизнес-сущности, их модели и базовый UI.
- `shared` — предметно-независимые UI и утилиты.

Слой может импортировать только слои справа от себя. Код внутри одного slice
может использовать относительные импорты. Внешний код должен использовать
публичный `index.ts` slice.

## Текущие slices

### `entities/book`

- Zod-схема и JSON parser книги.
- Типы `Book`, `BookCategory`, `BookTier`.
- Начальная загрузка JSON.
- `BookCard`.
- Книжный `formatReadDate`.

Entity не должна импортировать DnD, страницы или историю.

### `entities/history`

- Zod-схема события и файла истории.
- Типы `HistoryEvent` и `HistoryData`.

### `features/reorder-books`

- Состояние порядка книг.
- Позиционный DnD.
- Последовательная запись через dev API.
- Provider состояния перестановок.

UI карточки передаётся через widgets; feature не должна импортировать widgets.

### `features/history`

- Загрузка и состояние истории.
- Правая шторка истории.

Связь событий перестановки с историей выполняется в `app/providers`, чтобы две
features не зависели друг от друга напрямую.

### `widgets`

- `BookTierList` объединяет тиры, `BookCard` и reorder feature.
- `UnrankedBookList` объединяет плоский список карточек и reorder feature.
- `BookStatistics` предоставляет самостоятельные блоки статистики и модель расчёта данных для них.

### `pages/books`

- `BooksPage` отображает навигацию книжных подразделов и переключатель режима.
- `BookCategoryPage` выбирает нужный widget для категории.
- `BooksStatsPage` рассчитывает данные и собирает самостоятельные статистические widgets в страницу всей книжной библиотеки.
- `MoviesStatsPage` является самостоятельной страницей статистики фильмов.

## Где размещать новый код

- Новое поле книги или базовый вид карточки — `entities/book`.
- Новое действие пользователя — отдельная feature.
- Большой блок из нескольких entities/features — widget.
- Новый URL — `pages` и запись в `app/router`.
- Универсальный контрол без бизнес-терминов — `shared/ui`.
- Композиция providers/features — `app/providers`.
