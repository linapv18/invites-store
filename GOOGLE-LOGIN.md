# Acceso con Google

## Código implementado

El acceso y registro en español e inglés incluyen «Continuar con Google». Usa el flujo OAuth/PKCE del SDK oficial de Supabase, con navegación de página completa y sin ventanas emergentes. No se solicita acceso a Drive, calendario u otros servicios.

El botón solo aparece si `/auth/v1/settings` informa que Google está habilitado. Consultar ese estado no envía correos ni inicia una sesión. Si el proveedor no está habilitado o la consulta falla, el acceso por correo sigue disponible.

Después de Google se conserva el destino anterior (por ejemplo, el diseño que se estaba preparando). Ese destino se valida como ruta interna y se guarda temporalmente en `sessionStorage`, sin añadir parámetros arbitrarios a la lista de callbacks. La contraseña de Google no pasa por Invitesse.

## Configuración administrativa necesaria

### Google Cloud

1. Crear o elegir un proyecto en <https://console.cloud.google.com/>.
2. En **Google Auth Platform**, configurar **Branding** y **Audience** para Invitesse. Según la interfaz, estas opciones también pueden aparecer como pantalla de consentimiento OAuth en «APIs y servicios».
3. Si el público será externo, elegir audiencia externa. Mientras la app esté en modo de prueba, añadir los correos que podrán probarla como usuarios de prueba.
4. En **Clients** —o Credenciales—, crear un cliente OAuth de tipo **Web application**.
5. Añadir esta URI de redirección autorizada, exactamente:

   `https://fqtfdzqrialgjkdirdfr.supabase.co/auth/v1/callback`

6. Copiar el **Client ID** y **Client secret** a la configuración del proveedor en Supabase. No añadir el secreto al repositorio, al frontend ni al chat.

La URI de Google apunta a Supabase, no a `/cuenta/`. Google vuelve primero a Supabase; Supabase valida la identidad y después vuelve a Invitesse.

### Supabase

1. Abrir **Authentication → Sign In / Providers → Google** (el nombre de la sección puede variar).
2. Habilitar Google, pegar el Client ID y Client secret y guardar.
3. Mantener la configuración actual de URL:
   - Site URL: `https://www.invitesse.com`
   - Redirect URLs: `https://www.invitesse.com/cuenta/` y `https://www.invitesse.com/en/cuenta/`.
4. `/en/cuenta/` es el callback compatible autorizado: redirige a la página principal inglesa `/en/account/`, conservando el código de sesión.
5. Recargar la página de cuenta: el botón aparecerá automáticamente cuando el proveedor esté habilitado.

No se necesita SQL adicional ni otra variable secreta en Vercel para este proveedor. Supabase administra las identidades de acceso; no se crean filas de usuarios ni se vinculan cuentas desde JavaScript por comparar correos.

## Antes de abrirlo al público

Completar la información de marca y los documentos reales que Google solicite, pasar la configuración de audiencia a producción cuando corresponda y atender las verificaciones que indique Google. No inventar URLs de privacidad o condiciones. Mientras siga en modo de prueba, pueden aplicarse restricciones a los usuarios autorizados.

## Verificación

`python tests/browser/google_oauth.py` comprueba ambos idiomas a 1440, 390 y 320 px: disponibilidad del proveedor, escritura preservada durante la carga, inicio OAuth con PKCE, callback y regreso al diseño; también comprueba la cancelación. Todas las peticiones de Supabase/Google están interceptadas en ese recorrido: no inicia sesiones reales ni crea usuarios.

No se afirma haber validado el consentimiento real o la configuración de Google Cloud. Esa comprobación requiere habilitar el proveedor con las credenciales del proyecto y una cuenta autorizada de prueba.
