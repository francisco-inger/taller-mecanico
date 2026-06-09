# Redirigir SIEMPRE a login

## Estado
- `frontend/src/App.jsx`: se agregó una ruta que fuerza `GET /` -> `/login`.

## Problema reportado por usuario
- Al visitar `http://localhost:5173/` “sigue igual” (no redirige).

## Causas probables
- El servidor que está corriendo no está usando el código actualizado (falta reiniciar dev server / usa build previo / puerto no coincide).
- La SPA está montada con una base diferente y `/` no corresponde a esa ruta.
- La ruta `/` del router puede no estar siendo evaluada por algún motivo (p.ej. falta de refresh, o `BrowserRouter` con hosting distinto).

## Próximo paso
- Confirmar que el dev server actual esté usando el frontend correcto.
- Revisar `frontend/vite.config.js` para `base` y/o proxy.
- Forzar redirección desde `Login` o desde `main.jsx` temporalmente para validar.

