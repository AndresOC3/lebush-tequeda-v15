LEBUSH — ¡TeQueda! VFinal15 (Producción lista para Render)

1) En Render: New → Web Service → Upload a .zip → selecciona este archivo.
2) Build Command: npm run render-build
3) Start Command: npm run render-start
4) Variables de entorno: copia lo de .env (MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, PORT).
5) Tras el deploy, si deseas asegurar el admin: GET https://TU-DOMINIO.onrender.com/api/_seed_admin

Login por defecto:
mario@lebush.com / 12345
