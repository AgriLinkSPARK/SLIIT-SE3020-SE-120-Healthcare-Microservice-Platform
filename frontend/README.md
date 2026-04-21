# Frontend (React + Vite + Tailwind)

This frontend follows a scalable folder structure for your healthcare microservices project.

## Tech

- React + Vite
- Tailwind CSS
- React Router
- Axios

## Run

```bash
npm install
npm run dev
```

Then open:

- http://localhost:5173

## Build

```bash
npm run build
```

## Environment

Set API gateway/auth base in `.env`:

```env
VITE_API_GATEWAY_URL=http://localhost:8081/api
```

## Folder Structure

```text
frontend/
	public/
	src/
		assets/
			styles/
		components/
			common/
			doctor/
			patient/
			admin/
		pages/
			auth/
			doctor/
			patient/
			admin/
			common/
		services/
		context/
		hooks/
		routes/
		utils/
		App.jsx
		main.jsx
	.env
	package.json
	vite.config.js
```

## Current Implementation

- Login page: `src/pages/auth/LoginPage.jsx`
- Register page: `src/pages/auth/RegisterPage.jsx`
- Auth context/provider: `src/context/AuthContext.jsx`
- API client and auth service: `src/services/api.js`, `src/services/authService.js`
- Protected routing: `src/components/common/ProtectedRoute.jsx`
