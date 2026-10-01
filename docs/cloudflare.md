# Публикация на Cloudflare Pages

Сайт статический: Next.js собирает его в папку `out/`, и Cloudflare Pages
раздаёт её как есть. Никакого сервера и базы данных не нужно — вся конвертация
выполняется в браузере посетителя.

## 1. Сборка

```bash
npm ci
npm run build
```

Готовый сайт лежит в `out/`. Проверить его локально в том виде, в котором его
увидит Cloudflare, можно так:

```bash
npm run serve:out      # http://localhost:5050
```

Локальный сервер повторяет правила из `public/_headers`, поэтому заголовки
безопасности проверяются вместе с остальным сайтом.

## 2. Загрузка

Вариант через Git (рекомендуется — деплой при каждом пуше):

- репозиторий с проектом в GitHub;
- в Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** →
  **Connect to Git**;
- выбрать репозиторий;
- Build command: `npm run build`
- Build output directory: `out`
- Environment variables: пусто, если версия Node подходит платформе
  (при необходимости задать `NODE_VERSION`).

Вариант без Git:

```bash
npx wrangler pages deploy out --project-name dootter
```

## 3. Домен

Домен: `converter-doootter.ru`, основной адрес — без `www`.

NS домена ещё не перенесены. Порядок:

1. **Add a site** → ввести `converter-doootter.ru`.
2. Cloudflare покажет два NS-сервера вида
   `alice.ns.cloudflare.com` и `bob.ns.cloudflare.com`.
3. У регистратора (у Per.py) заменить текущие NS на эти два.
4. Дождаться статуса **Active** (обычно от нескольких минут до 24 часов).
5. В **Pages** → проект `dootter` → **Custom domains** → добавить
   `converter-doootter.ru`. Запись `www` добавлять не нужно: без неё
   Cloudflare не сможет отдать редирект, шаг 6 это закрывает.

Про SSL: сертификат Cloudflare выдаётся автоматически, отдельных действий не
требуется.

### www → apex

Доменные редиректы в файле `_redirects` не поддерживаются (Cloudflare
документирует их как неподдерживаемые), поэтому редирект настраивается в
панели через **Bulk Redirects**:

1. Создать DNS-запись: тип **A**, имя `www`, адрес `192.0.2.1`, проксирование
   **Proxied** (включено). Это специальный адрес-заглушка Cloudflare, запрос
   до Pages не дойдёт.
2. **Rules → Bulk Redirects** → создать список:
   | Source URL | Target URL | Status | Parameters |
   |---|---|---|---|
   | `www.converter-doootter.ru` | `https://converter-doootter.ru` | 301 | Preserve query string, Subpath matching, Preserve path suffix |
3. Создать правило по этому списку.
4. Проверить: `curl --head -i https://www.converter-doootter.ru/` — должен
   вернуться `301` с `location` на apex.

Почему apex, а не `www`: canonical-ссылки, sitemap и `security.txt`
сгенерированы на `https://converter-doootter.ru` из `src/lib/site.ts`. Если
основным сделать `www`, придётся менять конфиг и всю разметку, а репутация
нового домена у поисковиков лучше на одном адресе без редиректов.

Переадресация `*.pages.dev` → домен делается там же, через Bulk Redirects,
чтобы сайт не открывался по двум адресам.

## 4. Что уже настроено в коде

`public/_headers` — единственное место, где задаются заголовки: при
`output: "export"` Next.js отдавать их не умеет. Cloudflare Pages читает файл
приложения.

| Заголовок | Зачем |
| --- | --- |
| `Content-Security-Policy` | Сайт не грузит сторонний код; скрипты ограничены своим origin |
| `Strict-Transport-Security` | Принудительный HTTPS на два года |
| `X-Frame-Options: DENY` | Сайт нельзя встроить в чужую страницу |
| `X-Content-Type-Options: nosniff` | Браузер не угадывает тип файла |
| `Referrer-Policy` | Не передаёт referrer со страниц с документами |
| `Permissions-Policy` | Отключены камера, микрофон, геолокация |
| `Cross-Origin-Opener-Policy` | Изоляция окна |
| `Cache-Control` | Статика на год (`immutable`), HTML перепроверяется каждый раз |

`public/.well-known/security.txt` (RFC 9116) — рабочий контакт для жалоб:
`sars55460@gmail.com`.

## 5. Почему домен блокируют и что с этим делать

Cloudflare защищает от DDoS и автоматических атак, но он **не гарантирует**, что
домен не попадёт в блок-лист Google Safe Browsing или антивируса. Обычно причина
в репутации, и она складывается из нескольких вещей:

**Что уже сделано в коде:**

- файлы не покидают браузер — на сервере нет места, где можно спрятать вредонос;
- нет форм, аккаунтов, загрузок, комментариев и сторонних трекеров;
- есть Terms, Privacy, About, Contact и рабочий `security.txt`;
- сайт отдаётся по HTTPS с HSTS и не может быть встроен в чужую страницу;
- нет ни одного стороннего скрипта — CSP это запрещает.

**Что нужно сделать в аккаунте Cloudflare:**

- **Security → WAF → Managed Rules** — включить бесплатные правила.
- **Security → WAF → Rate limiting** — например, 60 запросов в минуту на IP для
  всего сайта. Конвертация идёт в браузере, поэтому легитимные пользователи
  делают мало запросов; всплеск трафика почти всегда означает бота.
- **Security → Bots** — включить блокировку заведомо вредных ботов (Automated Tools).
- **Security → Settings** — Security Level `Medium` или `High`.
- **Speed → Optimization** — включить Early Hints, Polish и Brotli.

**Главное, что влияет на блокировку — это не Cloudflare, а репутация домена:**

- отвечать на письма с жалобами; обычно это решает вопрос за несколько дней;
- домен должен быть зарегистрирован на реальное лицо/организацию, а не на
  анонимный или вчера созданный аккаунт — анонимная регистрация одна из главных
  причин блокировок;
- возраст домена имеет значение: только что купленный домен с конвертером
  вызывает подозрение сильнее всего;
- не стоит покупать «конвертер-ключ» для массовых автоматических конвертаций
  ботами — Cloudflare это увидит и заблокирует, и Google тоже;
- после снятия блокировки через Safe Browsing appeal срок ответа обычно занимает
  несколько недель.

Если домен уже внесён в Google Safe Browsing, нужна отдельная заявка:
https://safebrowsing.google.com/safebrowsing/report_error/

## 6. Проверка после деплоя

```bash
BASE_URL=https://<домен> npm run test:static
```

Скрипт проверит заголовки, `security.txt`, sitemap, canonical и все внутренние
ссылки уже на настоящем домене.
