# 🏍️ MotoMami ADV Club — Plataforma de Rodadas & Terracería

> **La red social y organizador de planes en moto doble propósito, trail y aventura.**
> Diseñado para rodar ligero, proponer y votar rutas en comunidad, fijar campamentos base seguros y salir a hacer loops de terracería sin peso inútil.

---

## ⚡ Características Principales

1. **Gestión de Garaje & Perfil de Piloto:**
   - Registra tus motos doble propósito (marca, modelo, año, cc, apodo, fotos).
   - Especificaciones clave para off-road: tipo de neumáticos montados (ej. Mitas E-07+ 50/50, TKC80), defensas, skid plates y modificaciones.
   - Historial de expediciones y kilómetros de terracería rodados.

2. **Moto Clubs / Crews con Clave Única:**
   - Crea tu propio squad o únete a uno existente usando una **Clave Única de Invitación** (ej. `MAMI-2026`).
   - Visualiza el roster de pilotos con sus roles (Capitán de Ruta, Barrendero, Rider) y sus motos asignadas.

3. **Propuesta y Votación Interactiva de Rutas:**
   - ¿Indecisos entre Corral de Piedra, Nanacamilpa, Mineral del Chico o Sierra Gorda? Sube todas las opciones y que la comunidad decida.
   - **Mapas Interactivos con Leaflet (Modo Oscuro Táctico):** Trazado de ruta en tiempo real, waypoints interactivos (Salida 🏁, Basecamp ⛺, Gasolina ⛽, Miradores 🏔️, Comida 🌮).
   - Ficha técnica completa: Kilómetros totales, horas estimadas, porcentaje de terracería vs. asfalto, altitud en msnm y clima nocturno.
   - Votación en vivo con barras de progreso y celebración con confeti.
   - Hilo de debate y comentarios por propuesta.
   - **Fijación Oficial:** El organizador fija la ruta ganadora con un solo clic.

4. **Logística de Campamento Base:**
   - **RSVP / Quiénes van:** Confirmación de asistencia con moto asignada.
   - **Checklist obligatorio:** Sleeping bag adecuado para la altitud, kit de mechas tubeless, compresor 12V y botiquín.
   - **Asignación de herramienta compartida:** Para no duplicar peso en las motos (radios VHF, compresores, hielera, leña).
   - **Bitácora y Galería:** Sube fotos de las brechas y atardeceres.

---

## 🚀 Despliegue en GitHub y Vercel (Cuenta: `pmartin.v2001@gmail.com`)

### 1. Subir el proyecto a GitHub

En tu terminal (PowerShell o CMD) dentro de esta carpeta (`MotoMami`), ejecuta:

```bash
# 1. Asegúrate de tener tu commit local listo (ya está preparado)
git status

# 2. Crea un nuevo repositorio vacío en tu cuenta de GitHub (ej. "MotoMami" o "motomami-club")
# En https://github.com/new

# 3. Conecta tu repositorio remoto y haz push (sustituye con tu usuario de GitHub):
git remote add origin https://github.com/TU_USUARIO_GITHUB/MotoMami.git
git branch -M main
git push -u origin main
```

---

### 2. Publicar en Vercel con tu cuenta (`pmartin.v2001@gmail.com`)

1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta `pmartin.v2001@gmail.com` (o vía GitHub).
2. Haz clic en **"Add New..."** $\rightarrow$ **"Project"**.
3. Selecciona tu repositorio recién subido `MotoMami` y haz clic en **"Import"**.
4. Vercel detectará automáticamente:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./`
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
5. Haz clic en **"Deploy"**.
6. ¡Listo! En menos de 60 segundos tu plataforma estará en vivo con un dominio gratis tipo `https://motomami-adv.vercel.app` (y con soporte para tu propio dominio personalizado).

---

## 💻 Desarrollo Local

Para correr la plataforma en tu computadora:

```bash
# Instalar dependencias
npm install

# Correr servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación funcionando.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router) & React 18
- **Estilos:** Tailwind CSS con paleta táctica (Asphalt `#06090D`, Rally Amber `#F59E0B`, Volt Green `#10B981`)
- **Mapas:** Leaflet + OpenStreetMap con Carto Dark Matter tiles
- **Iconografía:** Lucide React
- **Animaciones:** Canvas Confetti
- **Persistencia:** LocalStorage sincronizado en cliente (listo para conectar con Supabase o Firebase si deseas backend en la nube).
