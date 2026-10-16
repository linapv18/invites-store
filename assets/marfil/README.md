# Marfil opening media

`lazo-seda.webp` is the transparent silk still used by the opening. Its grayscale luminance and a masked color layer follow the invitation palette without tinting the paper.

A real untying clip can replace the still animation by setting `window.MarfilBowClip` before the opening is used:

```js
window.MarfilBowClip = {
  hevc: '/assets/marfil/lazo-desatar.mov', // HEVC with alpha for Safari
  webm: '/assets/marfil/lazo-desatar.webm' // VP9 with alpha for supporting browsers
};
```

These optional clips are not included. Supply both formats with matching transparent framing and initial knot position, no audio, and a duration around 1–1.8 seconds. Match the selected ribbon palette when supplying the clip. The player starts only after a tap, opens the vellum after playback, and falls back to the still animation on playback failure or timeout. Reduced motion skips the clip. Resetting the opening stops playback.
