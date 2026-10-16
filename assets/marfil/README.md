# Marfil opening media

The opening uses the corrected user-supplied `lazo-transparente-corregido.webm` ribbon animation, trimmed from eight seconds to 50 frames (2.082 seconds). Encoding preserves alpha and reduces the canvas to 768 × 432.

- `lazo-inicio.webp`: first frame, used by the interactive bow before playback.
- `lazo-desatar.webp`: single-play animated WebP used across browsers, including iOS. It avoids depending on VP9 alpha support or autoplay permissions.
- `lazo-desatar.webm`: VP9 alpha version, available for a video-specific integration.
- `lazo-seda.webp`: earlier generated still, retained as a source asset; not requested by the page.

Poster and animation share framing, position and a palette hue filter. The ribbon is included in the animation, so the former CSS ribbon strips are hidden. The vellum opens after playback; the guest then presses Open invitation. Reduced motion skips playback, and loading errors fall back to the still transition. Resetting the opening removes the playing media and restores the poster.

For a replacement clip, `window.MarfilBowClip` can supply `{animated, duration}` or `{hevc, webm}`. Video sources should have alpha, matching framing and an appropriate palette; Safari may require an HEVC alpha variant. No video source is required for the default animated-WebP path.
