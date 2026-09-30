# Activar correo y Google en Mi Recetario

El nuevo diseño y los flujos de autenticación están implementados. El envío de correo y Google requieren configurar servicios externos; no hay códigos simulados. `auth-config.js` viene vacío y el formulario muestra un aviso hasta completar esta configuración.

## 1. Crear el proyecto Supabase

1. Crea un proyecto en https://supabase.com/dashboard.
2. Copia su **Project URL** y la clave **publishable** (o la clave pública **anon** de proyectos anteriores).
3. Completa `auth-config.js`. Estos dos datos son públicos. No uses `service_role`, una clave `secret`, contraseñas SMTP ni el secreto OAuth en archivos publicados en GitHub.
4. En Authentication configura **Site URL** y **Redirect URLs** con:
   `https://jeffrey782.github.io/mi-recetario-pwa/`
5. Para probar Google desde el servidor de tu PC, añade `http://localhost:8000/` a Redirect URLs y cambia temporalmente `redirectUrl` en `auth-config.js`. Antes de publicar restaura la dirección HTTPS.
6. Activa Email y la confirmación de correo; establece una contraseña mínima de 8 caracteres.

## 2. Correo con código

Configura **Custom SMTP** en Supabase con un proveedor de correo transaccional. El envío predeterminado de Supabase está limitado a los miembros de tu organización, y las plantillas personalizadas pueden requerir SMTP propio. Las credenciales SMTP se configuran únicamente en Supabase.

En **Authentication → Email Templates**, cambia las plantillas para que incluyan el código `{{ .Token }}` en vez de depender de un enlace.

**Confirm signup** (confirmar registro):

```html
<h2>Bienvenido a Mi Recetario</h2>
<p>Introduce este código en la aplicación para verificar tu correo:</p>
<p style="font-size:28px;font-weight:bold">{{ .Token }}</p>
<p>Si no solicitaste una cuenta, puedes ignorar este correo.</p>
```

**Reset password** (recuperación):

```html
<h2>Recupera tu contraseña</h2>
<p>Introduce este código en Mi Recetario para crear una contraseña nueva:</p>
<p style="font-size:28px;font-weight:bold">{{ .Token }}</p>
<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
```

El servicio valida y hace caducar los códigos. La aplicación acepta de 6 a 10 dígitos según la configuración del proyecto. El botón de reenvío espera al menos un minuto; el proveedor también impone sus propios límites.

## 3. Activar Google

1. En https://console.cloud.google.com/ crea/configura un proyecto y su pantalla de consentimiento OAuth.
2. Crea un OAuth Client ID del tipo **Web application**.
3. En Authorized redirect URIs usa la **Callback URL que muestra Supabase** al configurar el proveedor Google; normalmente termina en `/auth/v1/callback`. Esta URL no es la dirección de GitHub Pages.
4. Copia Client ID y Client Secret en **Supabase → Authentication → Sign In / Providers → Google** y activa el proveedor. No pongas Client Secret en GitHub.
5. Si Google está en modo de pruebas, añade tu correo y el del profesor como usuarios de prueba antes de la exposición.
6. La app usa PKCE y vuelve a la dirección configurada en `auth-config.js`. En un iPhone, el navegador puede volver a Safari; termina el acceso en el mismo navegador donde lo comenzaste. Comprueba por separado el acceso desde el icono instalado.

El acceso por Google toma el nombre del perfil; el registro por correo pide un usuario. En esta versión el usuario es un nombre visible, no un identificador único reservado. Se inicia sesión por correo y contraseña.

## 4. Publicar y probar

Sube el contenido actualizado de la carpeta al mismo repositorio. Deben incluirse `auth.js`, `auth-config.js`, `app.js`, `index.html`, `styles.css` y `service-worker.js`. La caché ya se incrementó a `mi-recetario-v2-auth`; si publicas otra modificación, vuelve a incrementarla.

Prueba en el iPhone con Internet:

- Registro con usuario, correo y contraseñas coincidentes; el acceso solo debe completarse con un código válido.
- Código erróneo/caducado y reenvío.
- Inicio de sesión por correo y contraseña.
- Recuperación por código, contraseña nueva e inicio de sesión con esa contraseña.
- Acceso con Google y cancelación del consentimiento.
- Ojito: mostrar/ocultar sin enviar el formulario.
- Después de acceder, abre las recetas en modo avión.

Las cuentas locales anteriores se conservan mediante **Acceder a mi cuenta local anterior**. No se migran automáticamente a Supabase. Exporta sus recetas desde Perfil y luego impórtalas desde la nueva cuenta para conservarlas. Las recetas siguen siendo locales, no se sincronizan entre dispositivos y no están cifradas por el login.

Documentación oficial:
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/reference/javascript/auth-verifyotp
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/auth-smtp
