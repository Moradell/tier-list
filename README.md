# Tier List

Личный книжный тир-лист на React, TypeScript и Vite.

```bash
npm install
npm run dev
```

## Структура `src`

```text
src/
├── app/                       # Запуск и композиция приложения
│   ├── router/                # Конфигурация маршрутов
│   ├── providers/             # Связывание независимых features
│   ├── layouts/               # Глобальные layout
│   └── styles/                # Глобальные стили
├── pages/                     # Компоненты маршрутов
│   ├── books/                 # Страницы книжного раздела
│   └── MoviesPage/            # Страница фильмов
├── widgets/                   # Крупные блоки страниц
│   ├── BookTierList/          # Тир-лист с рядами S–F
│   ├── UnrankedBookList/      # Сплошной список вне рейтинга
│   └── MovieList/             # Каталог просмотренных фильмов и сериалов
├── features/                  # Пользовательские действия
│   ├── reorder-books/         # DnD и сохранение порядка
│   └── history/               # Provider и шторка истории
├── entities/                  # Бизнес-сущности
│   ├── book/                  # Модель, JSON-схема и BookCard
│   ├── history/               # Модель события истории
│   └── movie/                 # Модель фильма и MovieCard
└── shared/                    # Предметно-независимый код
    └── ui/                    # Tabs, Tooltip и будущие общие компоненты
```

Архитектура следует прагматичному Feature-Sliced Design. Зависимости направлены
только сверху вниз:

```text
app → pages → widgets → features → entities → shared
```

Нижний слой не должен импортировать верхний. Например, `BookCard` не знает о
DnD: widget передаёт ему обычные DOM-обработчики, полученные из
`features/reorder-books`. Независимые features связываются в `app/providers`.

Для внешних импортов у slices используются публичные `index.ts`. Прямой импорт
внутреннего файла допустим только в Node-инструментах (`scripts`, Vite plugins),
где импорт общего barrel-файла может затянуть браузерный UI или SCSS.

### Ответственность слоёв

- `app` создаёт providers и router, но не содержит книжную бизнес-логику.
- `pages` собирает маршрут из widgets и features.
- `widgets` объединяет несколько сущностей и пользовательские действия.
- `features` реализует завершённое действие пользователя.
- `entities` хранит модель и представление одной бизнес-сущности.
- `shared` не знает о книгах, тирах или LiveLib.

`formatReadDate` находится в `entities/book/lib`, а не в `shared`: функция знает
про книжное значение `-` и текст отсутствующей даты чтения. В `shared/lib`
следует выносить только действительно предметно-независимые функции.

## Данные и локальное редактирование

Книги хранятся в массивах объектов `data/books/*.json`. Поля книги:

```json
{
  "tier": "S",
  "position": "1",
  "title": "Название",
  "author": "Автор",
  "user_rating": "5",
  "livelib_rating": "4.5",
  "url": "https://www.livelib.ru/book/...",
  "cover": "/covers/example.jpg",
  "year": "2020",
  "read_date": "2024-01-31"
}
```

`position` начинается с `1` внутри каждого тира. Файл должен быть расположен в
порядке `S → A → B → C → D → F`. Для `unranked.json` позиция сквозная.

История хранится в `data/books/history.json`. Текущая библиотека внесена в
`knownBookIds`, поэтому события `new` создаются только для книг, добавленных
после появления истории.

Просмотренные фильмы загружаются из `data/movies/movies.json`, сериалы — из
`data/movies/series.json`, а аниме — из `data/movies/anime.json`. Каждый плоский
каталог загружается отдельным chunk только при переходе в соответствующий подраздел.
Счётчики табов генерируются в `data/movies/catalog-meta.json` командой
`npm run movies:meta`; перед `dev` и `build` она запускается автоматически.

Киноистория хранится отдельно в `data/movies/history.json`. Текущие записи
являются базовой отметкой, а при последующих синхронизациях в историю попадают
только новые `kp_id` с постером, названием и датой добавления. Команда
`npm run movies:sync` обновляет и счётчики, и историю перед `dev` и `build`.

DnD работает только в `npm run dev`. Dev-only Vite API атомарно обновляет JSON,
пересчитывает позиции и добавляет событие истории. В production и на GitHub
Pages карточки не являются draggable.

## Маршруты

Для совместимости с GitHub Pages используется `HashRouter`:

```text
#/books/novels
#/books/stories
#/books/manga
#/books/unranked
#/movies/films
#/movies/series
#/movies/anime
```

## Проверки

```bash
npm run typecheck
npm run books:validate
npm run books:sort
npm run build
```

- `typecheck` проверяет TypeScript без генерации файлов.
- `books:validate` проверяет JSON, позиции, дубликаты и историю.
- `books:sort` сортирует JSON и пересчитывает позиции.
- `build` создаёт production-сборку в `dist`.

Локальный `BACKLOG.md` добавлен в `.gitignore` и не публикуется.

## GitHub Pages

Приложение автоматически собирается и публикуется в GitHub Pages при каждом
push в ветку `main`.

В настройках репозитория выберите **Settings → Pages → Source → GitHub Actions**.
