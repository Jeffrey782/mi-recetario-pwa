# Nueva versión: catálogo, sugerencias, planes, lista de compras e inventario

Empieza por **ACTIVAR-INVENTARIO.md**. Incluye los pasos para ejecutar el SQL en Supabase, publicar en GitHub y probar en iPhone. Las recetas y el inventario pueden sincronizarse después de activar el SQL; la guía original de abajo describe la versión anterior de guardado local.

# Mi Recetario PWA

Aplicación web instalable para demostrar un recetario en iPhone. Se abre como carpeta en Visual Studio 2026 y no requiere .NET MAUI, Mac, cuenta Apple Developer ni servidor para guardar los datos.

## Login actualizado

Esta versión añade correo y contraseña, usuario al registrarse, código de verificación por correo, recuperación por código, acceso con Google y botones para mostrar/ocultar contraseñas. Para activar los servicios reales sigue **CONFIGURAR-LOGIN.md**. No podrás crear cuentas nuevas hasta configurar Supabase, SMTP y Google. El acceso local anterior permanece disponible para cuentas ya existentes.

## Funciones incluidas

- Autenticación con Supabase; recetas separadas por cuenta y guardadas en el navegador.
- Tres recetas de ejemplo; crear, editar y eliminar recetas propias.
- Buscar, filtrar por categoría y marcar favoritos.
- Exportar e importar las recetas de la cuenta activa en un archivo JSON.
- Pantalla de inicio y archivos de la aplicación disponibles sin Internet tras la primera carga correcta.

Las cuentas nuevas se autentican en Supabase; los datos de recetas siguen almacenados localmente. El acceso requiere conexión, aunque una sesión local ya abierta permite consultar las recetas offline. Desinstalar la PWA o borrar sus datos puede eliminar las recetas; usa **Perfil → Exportar mis recetas** para hacer una copia.

## Abrir en Visual Studio 2026

1. Descomprime el ZIP y en Visual Studio elige **Archivo → Abrir → Carpeta**; selecciona `MiRecetario-PWA`.
2. Para probarla en Windows sin instalar nada más, abre PowerShell dentro de la carpeta y ejecuta `powershell -NoProfile -ExecutionPolicy Bypass -File .\Iniciar-Mi-Recetario.ps1`. Se abrirá `http://localhost:8000/`.
3. Configura el servicio siguiendo CONFIGURAR-LOGIN.md y después crea un usuario. Las recetas de muestra aparecerán en la pantalla principal.

Si ya tienes Python, también puedes ejecutar `python -m http.server 8000` desde la carpeta. Deja abierta la terminal que inició el servidor durante la prueba. La opción `-ExecutionPolicy Bypass` se aplica solo a esa ejecución del script y no modifica la configuración permanente de Windows.

Abrir `index.html` como archivo `file://` no instala el service worker; utiliza un servidor local o la dirección HTTPS publicada.

## Publicar gratis con GitHub Pages

1. Crea un repositorio nuevo, por ejemplo `mi-recetario-pwa`.
2. Sube **el contenido de esta carpeta a la raíz** del repositorio: `index.html`, `app.js`, `styles.css`, `service-worker.js`, `manifest.webmanifest` y la carpeta `icons`.
3. En GitHub entra en **Settings → Pages** y publica desde la rama principal y la carpeta raíz (`/`).
4. Espera a que aparezca la dirección `https://TU-USUARIO.github.io/mi-recetario-pwa/` y ábrela una vez con conexión.

También sirve cualquier alojamiento HTTPS de archivos estáticos. El nombre del repositorio y el dominio pueden cambiar; las rutas de esta PWA son relativas.

## Instalar en iPhone

1. Abre la dirección HTTPS en **Safari** con Internet.
2. Toca **Compartir → Agregar a pantalla de inicio → Agregar** (en algunas versiones puedes elegir **Abrir como app**).
3. Abre el nuevo icono y registra tu usuario. Espera a que cargue completamente antes de desconectarte.
4. Para demostrar el modo offline, activa el modo avión y abre el icono de Mi Recetario. Prueba la búsqueda, los favoritos y agregar una receta.

En la exposición usa la **misma instalación y el mismo iPhone** donde preparaste los datos. Los usuarios y recetas no se sincronizan entre teléfonos o entre Safari y otras instalaciones. Antes de presentar, repite la prueba en modo avión y conserva el respaldo JSON.

## Archivos

- `index.html`: entrada y metadatos de instalación.
- `styles.css`: diseño adaptable al iPhone.
- `app.js`: pantallas y almacenamiento local.
- `auth.js`, `auth-config.js`: login y configuración pública de Supabase.
- `service-worker.js`: caché de los archivos necesarios para abrir sin Internet.
- `manifest.webmanifest`, `icons/`: nombre, colores e iconos de la instalación.
- `Iniciar-Mi-Recetario.ps1`: servidor de prueba local en Windows.

Si modificas los archivos después de publicarlos, cambia `mi-recetario-v1` por una nueva versión en `service-worker.js` para que la instalación reciba la actualización al volver a conectarse.
