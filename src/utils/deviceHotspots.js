// Feature hotspots on the Carmen device photo, shared by the desktop scene and
// the mobile Home. Positions are % of each photo:
// - desktop: assets/desktop/home-bg.jpg (2752x1536 original), from the Figma frame
// - mobile: assets/home/fondo-home.jpg, a 1473x2620 crop of a taller render of the
//   same photo. Image matching puts it 544px lower and 639.5px further left than
//   the desktop original, at the same scale, so mobile = (desktop px - offset) / crop.
// `align` keeps mobile labels on screen for dots near the edges.
export const DEVICE_HOTSPOTS = [
  { key: 'pantalla', label: 'Pantalla interactiva', desktop: { x: 64.08, y: 25.19 }, mobile: { x: 76.31, y: 35.53, align: 'right' } },
  { key: 'nfc', label: 'Soporte inteligente NFC', desktop: { x: 47.18, y: 52.87 }, mobile: { x: 44.73, y: 51.76 } },
  { key: 'llamada', label: 'Responder/finalizar llamada', desktop: { x: 49.61, y: 61.85 }, mobile: { x: 49.27, y: 57.02 } },
  { key: 'parlante', label: 'Parlante integrado', desktop: { x: 59.07, y: 67.59 }, mobile: { x: 66.94, y: 60.39 } },
  { key: 'microfonos', label: 'Micrófonos direccionales', desktop: { x: 37.52, y: 68.24 }, mobile: { x: 26.68, y: 60.77, align: 'left' } },
]
