# Рабочий процесс

## Команды

```bash
npm run dev
npm run typecheck
npm run books:validate
npm run books:sort
npm run build
npm run preview
```

## Перед изменением

1. Определите правильный FSD-слой.
2. Проверьте публичный API затрагиваемого slice.
3. Найдите все потребители через `rg`.
4. Убедитесь, что изменение данных не перезапишет пользовательский порядок.

## После изменения

Минимум:

```bash
npm run typecheck
npm run build
git diff --check
```

При изменении модели, данных книг, DnD, history или Vite API также обязательно:

```bash
npm run books:validate
```

Не запускайте `books:sort` автоматически, если задача не предполагает изменение
порядка данных.

## GitHub Pages

- Vite base: `/tier-list/`.
- Router: `HashRouter`.
- Обложки формируются через `import.meta.env.BASE_URL`.
- Deploy workflow публикует `dist` после push в `main`.
- DnD отключён через `import.meta.env.DEV`.

## Локальные файлы

`BACKLOG.md` игнорируется Git и используется только локально. Не удаляйте его и
не пытайтесь принудительно добавить в коммит.
