# WebSocket Lesson 1

## Описание

Учебный проект: чат на Django + Channels (WebSocket) и фронтенд на Vite + React.

## Быстрый старт

### Сервер (Django)

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Клиент (Vite + React)

```bash
cd client
npm install
npm run dev
```

## Структура
- `server/` — Django backend (WebSocket, REST)
- `client/` — Vite + React frontend

## Требования
- Python 3.12+
- Node.js 18+ 