# SIMAP — Frontend Web (React + TypeScript)

> **Trabajo 2: Frontend, consumo de API y seguridad**  
> Asignatura: Lenguaje de Programación Web II (UT2)  
> Dominio: Sistema de Mantenimiento de Parque Automotor (SIMAP)

---

## 🚀 Tecnologías y Herramientas

- **Framework:** React 19 + TypeScript + Vite 8
- **Enrutamiento:** React Router 7 (rutas públicas, protegidas y por roles)
- **Estado Asíncrono y Caché:** TanStack Query 5 (React Query)
- **Cliente HTTP:** Axios con interceptores para JWT, redirección 401/403 y normalización de errores
- **Formularios y Validación:** React Hook Form + Zod (`@hookform/resolvers`)
- **Estilos:** CSS Modules + Tokens CSS globales (mobile-first, accesible WCAG 2.2 AA)

---

## 📦 Requisitos Previos

- **Node.js:** v18+ (recomendado v20+)
- **Backend:** SIMAP API en ejecución (`http://localhost:5288`)

---

## ⚙️ Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   cd SIMAP-FRONT
   npm install
   ```

2. **Variables de entorno:**
   Copiar `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Contenido esperado:
   ```env
   VITE_API_URL=http://localhost:5288/api/v1
   ```

3. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 🏛️ Estructura del Proyecto

```
SIMAP-FRONT/
├── src/
│   ├── app/                # Layout raíz accesible, encabezado, pie y navegación
│   ├── shared/             # Cliente HTTP centralizado (Axios), DTOs y tipos globales
│   │   ├── api/            # httpClient.ts (manejo de Bearer token y errores normalizados)
│   │   └── types.ts        # Tipos alineados 1:1 con el backend .NET
│   ├── features/           # Módulos por caso de negocio
│   │   ├── auth/           # LoginPage, AuthContext, ProtectedRoute, RoleGuard, authService
│   │   ├── vehiculos/      # Listado y formularios del recurso principal
│   │   └── bitacoras/      # Listado y formularios del recurso relacionado
│   ├── pages/              # Páginas de estado de error (404 Not Found, 403 Forbidden)
│   ├── App.tsx             # Árbol de rutas declarativo
│   ├── main.tsx            # Punto de entrada y proveedores globales
│   └── index.css           # Tokens de diseño y reset accesible
├── .env.example            # Ejemplo de variables sin secretos
└── vite.config.ts          # Configuración del servidor Vite en puerto 5173
```

---

## 🔒 Aspectos de Seguridad y Accesibilidad

- **Token JWT:** Almacenado en `sessionStorage` (limpieza al cerrar pestaña, fuera de URL y logs).
- **CORS:** Alineado estrictamente con el backend (`http://localhost:5173`).
- **Mapeo de Roles:** Protección mediante `ProtectedRoute` y `RoleGuard`, con respaldo obligatorio de validación en el backend.
- **Accesibilidad (WCAG 2.2 AA):**
  - Landmarks semánticos (`header`, `nav`, `main`, `footer`).
  - Enlace *skip-link* para saltar directamente al contenido principal con teclado.
  - Formularios con `<label>` vinculados, `aria-describedby` y `aria-invalid` para anuncios con lector de pantalla.
  - Contraste superior a 4.5:1 y objetivos táctiles ≥ 44×44 px.