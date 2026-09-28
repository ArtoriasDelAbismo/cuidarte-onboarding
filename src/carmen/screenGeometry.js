// Where the device's screen is in each photo, for CarmenScreen.
//
// Desktop (assets/desktop/home-bg.jpg, 2752x1536): measured by flood-filling
// the near-black screen and taking the x+y / x-y extremes (the same method
// cuidarte-carmen's DeviceMockup used on its own photo), then inset ~7px toward
// the center so the face never spills onto the bezel. A slight trapezoid.
//
// Mobile (assets/home/fondo-home.jpg): a 1473x2620 crop of a taller render of
// the same photo, 639.5px further left and 544px lower than the desktop one
// (see utils/deviceHotspots.js), so its corners are the desktop ones shifted.
const DESKTOP_CORNERS = {
  topLeft: { x: 978, y: 358 },
  topRight: { x: 1795, y: 363 },
  bottomRight: { x: 1807, y: 738 },
  bottomLeft: { x: 959, y: 741 },
}

const MOBILE_OFFSET = { x: -639.5, y: 544 }

function shift(corners, { x, y }) {
  return Object.fromEntries(Object.entries(corners).map(([k, p]) => [k, { x: p.x + x, y: p.y + y }]))
}

export const DESKTOP_SCREEN = {
  id: 'carmen-screen-desktop',
  imageWidth: 2752,
  imageHeight: 1536,
  corners: DESKTOP_CORNERS,
  cornerRadius: 36,
}

export const MOBILE_SCREEN = {
  id: 'carmen-screen-mobile',
  imageWidth: 1473,
  imageHeight: 2620,
  corners: shift(DESKTOP_CORNERS, MOBILE_OFFSET),
  cornerRadius: 36,
}
