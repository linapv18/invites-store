# Fuentes locales de Invitesse

Se conservan las familias, estilos, pesos y subconjuntos de idioma de las hojas de Google Fonts originales. Las fuentes se sirven desde el mismo sitio y mantienen `font-display: swap`. Los archivos `LICENSE-*.txt` contienen las licencias de cada familia. `sources.json` relaciona las consultas originales con sus hojas locales.

Para actualizar las familias de demos/editor, ejecutar `python scripts/vendor-fonts.py` con acceso de red y revisar los cambios y capturas. Este comando no forma parte del build. El build funciona sin consultar Google Fonts. La hoja comercial `assets/brand/fonts.css` usa Bodoni Moda y Geist variables, con los subconjuntos latino y latino extendido para la tienda ES/EN.

Los nombres de archivo se derivan de sus bytes. La salida de producción vuelve a calcular fingerprints tras resolver dependencias; solo `/assets/immutable/` recibe caché inmutable. No aplicar esa política a configuración, HTML o contenido privado.
