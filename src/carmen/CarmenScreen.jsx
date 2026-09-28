import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { CarmenFace } from './CarmenFace'
import { useResponsiveZoom } from './useResponsiveZoom'
import './CarmenScreen.css'

const SCREEN_COLOR = '#040406' // sampled from the photo's screen

// Closed polygon with rounded corners (quadratic curve at each vertex), rounded
// in image-pixel space so the corners stay circular, then converted to the
// 0..1 units clipPathUnits="objectBoundingBox" expects. From cuidarte-carmen.
function roundedPolygonPath(points, radius, toPathSpace) {
  const edgePoint = (from, to, dist) => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.hypot(dx, dy)
    return { x: from.x + (dx / len) * dist, y: from.y + (dy / len) * dist }
  }
  const fmt = (p) => {
    const s = toPathSpace(p)
    return `${s.x} ${s.y}`
  }
  const commands = points.flatMap((curr, i) => {
    const prev = points[(i - 1 + points.length) % points.length]
    const next = points[(i + 1) % points.length]
    return [`${i === 0 ? 'M' : 'L'} ${fmt(edgePoint(curr, prev, radius))}`, `Q ${fmt(curr)} ${fmt(edgePoint(curr, next, radius))}`]
  })
  return `${commands.join(' ')} Z`
}

// Bounding box (as % of the photo) and rounded clip path for a screen geometry
// from ./screenGeometry.js.
function screenLayout({ imageWidth, imageHeight, corners, cornerRadius }) {
  const left = Math.min(corners.topLeft.x, corners.bottomLeft.x)
  const right = Math.max(corners.topRight.x, corners.bottomRight.x)
  const top = Math.min(corners.topLeft.y, corners.topRight.y)
  const bottom = Math.max(corners.bottomLeft.y, corners.bottomRight.y)
  const width = right - left
  const height = bottom - top
  return {
    box: {
      left: `${(left / imageWidth) * 100}%`,
      top: `${(top / imageHeight) * 100}%`,
      width: `${(width / imageWidth) * 100}%`,
      height: `${(height / imageHeight) * 100}%`,
    },
    clipPath: roundedPolygonPath(
      [corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft],
      cornerRadius,
      (p) => ({ x: (p.x - left) / width, y: (p.y - top) / height }),
    ),
  }
}

const layouts = new Map()
function cachedLayout(geometry) {
  if (!layouts.has(geometry.id)) layouts.set(geometry.id, screenLayout(geometry))
  return layouts.get(geometry.id)
}

function ResponsiveCamera() {
  const zoom = useResponsiveZoom()
  return <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={zoom} />
}

// Carmen's animated face drawn onto the device's screen in a photo. Must be
// rendered inside a box with that photo's exact size (the desktop scene's or
// the mobile stage), with the matching `geometry` from ./screenGeometry.js.
// Asleep (eyes closed) until `carmen` connects; tapping the screen wakes her or
// sends her back to sleep, like in cuidarte-carmen. `interactive` turns the tap
// off (e.g. while the Home intro covers the scene); `hint` shows "Tocá para
// hablar" while she sleeps, for screens with no other button pointing at her.
export default function CarmenScreen({ carmen, geometry, interactive = true, hint = false }) {
  const { status, toggle, speakRef, happyTargetRef, concernedTargetRef, sadTargetRef } = carmen
  const { box, clipPath } = cachedLayout(geometry)

  return (
    <>
      <svg width="0" height="0" className="carmen-screen__defs" aria-hidden="true">
        <defs>
          <clipPath id={geometry.id} clipPathUnits="objectBoundingBox">
            <path d={clipPath} />
          </clipPath>
        </defs>
      </svg>

      <div className="carmen-screen" style={{ ...box, clipPath: `url(#${geometry.id})` }}>
        <Canvas orthographic dpr={[1, 2]}>
          <ResponsiveCamera />
          <color attach="background" args={[SCREEN_COLOR]} />
          <CarmenFace
            speakRef={speakRef}
            happyTargetRef={happyTargetRef}
            concernedTargetRef={concernedTargetRef}
            sadTargetRef={sadTargetRef}
            asleep={status !== 'connected'}
          />
          <EffectComposer>
            <Bloom mipmapBlur={false} intensity={0.8} luminanceThreshold={0.25} luminanceSmoothing={0.15} radius={0.4} />
          </EffectComposer>
        </Canvas>

        <button
          type="button"
          className="carmen-screen__tap"
          onClick={toggle}
          disabled={!interactive || status === 'connecting'}
          tabIndex={interactive ? 0 : -1}
          aria-label={status === 'connected' ? 'Terminar conversación con Carmen' : 'Hablar con Carmen'}
        />

        {hint && (status === 'idle' || status === 'error') && (
          <span className="carmen-screen__hint" aria-hidden="true">
            Tocá para hablar
          </span>
        )}

        {status === 'connecting' && (
          <div className="carmen-screen__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </>
  )
}
