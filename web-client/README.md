# ArogyaBlock Web Client (Login/Register)

A lightweight asynchronous web client using HTML + Tailwind CSS + JavaScript `fetch` (`async/await`).

## Features

- Login page UI and Register page UI inspired by your provided screenshot style.
- Tailwind CSS-based responsive design (desktop + mobile).
- Async API calls to auth service:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Stores JWT in `localStorage` on successful login.

## Run

From project root:

```bash
cd web-client
python -m http.server 3000
```

Then open:

- http://localhost:3000

## API Base URL

Current default in `app.js`:

- `http://localhost:8081/api/auth`

If needed, update `API_BASE` in `app.js`.

## Notes

- Make sure your `auth-service` is running on port `8081`.
- If browser blocks requests, configure CORS in auth-service.
