# Anime Reverse Search 🔍

Una aplicación web moderna y elegante que permite identificar animes a partir de capturas de pantalla utilizando inteligencia artificial. Simplemente arrastra una imagen y descubre de qué anime es, el episodio exacto y el minuto en que aparece.

## ✨ Características

- **Identificación Precisa**: Utiliza la API de `trace.moe` para encontrar coincidencias exactas de escenas de anime.
- **Información Detallada**: Obtiene metadatos ricos (título, sinopsis, episodios, etc.) a través de la API de Anilist.
- **Interfaz Moderna**: Diseño "Glassmorphism" con animaciones fluidas utilizando Framer Motion y Tailwind CSS.
- **Drag & Drop**: Zona de carga de imágenes intuitiva y fácil de usar.
- **Multi-idioma**: Soporte para Español e Inglés.
- **Modo Oscuro**: Diseño optimizado para visualización cómoda en entornos oscuros.

## 🛠️ Tecnologías Utilizadas

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **APIs**:
  - [trace.moe](https://trace.moe/) (Reconocimiento de imágenes)
  - [Anilist](https://anilist.co/) (Información de animes)

## 🚀 Comenzando

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- Node.js 18.17 o superior
- npm (o yarn/pnpm/bun)

### Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd proyecto
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📁 Estructura del Proyecto

```
src/
├── app/              # Rutas y páginas de Next.js (App Router)
│   ├── api/          # API Routes (Backend proxy)
│   └── page.tsx      # Página principal
├── components/       # Componentes de React reutilizables
├── hooks/            # Custom Hooks (Lógica de negocio)
├── lib/              # Utilidades y tipos
└── translations/     # Archivos de traducción
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir lo que te gustaría cambiar.

## 📄 Licencia

[MIT](https://choosealicense.com/licenses/mit/)
