# Visitas dentro del admin

`/admin/#analiticas` consulta Vercel Web Analytics desde el servidor, después de validar la sesión y ADMIN_EMAILS. El conteo público y la elección de cookies siguen separados.

## Configuración única

1. En https://vercel.com/account/tokens crea un token llamado `Invitesse Admin Analytics`, con acceso al equipo `lmpere21asuedus-projects`. Limita su alcance y vigencia según las opciones que ofrezca tu cuenta. Al vencer o revocarlo, tendrás que reemplazarlo.
2. En https://vercel.com/lmpere21asuedus-projects/invites-store/settings/environment-variables crea `VERCEL_ANALYTICS_TOKEN` para **Production**, tipo **Secret**, y pega ahí el token. No lo compartas en el chat ni en código.
3. Vuelve a desplegar el proyecto para que las funciones reciban la variable. Abre `/admin/#analiticas`.

El proyecto se toma de `VERCEL_PROJECT_ID` (o del nombre `invites-store`); el equipo predeterminado es `team_lCM12u8gqwtrRnVvQ10bpmRR`. `VERCEL_ANALYTICS_TEAM_ID` permite indicar otro equipo si se migra el proyecto.

## Qué muestra

Visitantes estimados, páginas vistas, actividad por día o semana, las diez principales páginas, procedencias, países y dispositivos. Solo producción. El periodo aplica al mismo intervalo de tiempo para todos los informes. Vercel agrupa los días en UTC; la fecha de actualización se muestra en Colombia. El servidor conserva los resultados durante un minuto para evitar consultas repetidas. No se suman los visitantes de las páginas individuales para obtener el total.

No se envían al navegador el token, identificadores de visitantes ni respuestas completas del proveedor. Si la credencial falta, vence o no tiene permisos, si el proveedor falla o si el plan no permite la consulta, la sección muestra el estado correspondiente; las analíticas de pedidos permanecen disponibles. Una respuesta real de cero visitas se presenta como cero, no como un error.

La integración usa los endpoints oficiales `/v1/query/web-analytics/visits/count` y `/v1/query/web-analytics/visits/aggregate`. Los datos históricos disponibles dependen de la activación y retención de Vercel.
