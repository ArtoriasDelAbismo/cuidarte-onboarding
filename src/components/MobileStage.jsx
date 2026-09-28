import { lazy, Suspense } from 'react'
import './MobileStage.css'
import { useCarmenContext } from '../carmen/carmenContext'
import { MOBILE_SCREEN } from '../carmen/screenGeometry'

import fondo from '../assets/home/fondo-home.jpg'

// three.js is heavy and only needed once a device screen is on the page, so
// Carmen's face loads as its own chunk (shared with the desktop scene).
const CarmenScreen = lazy(() => import('../carmen/CarmenScreen.jsx'))

// The Carmen device photo behind the mobile Home, Salud, Seguridad and
// Bienestar screens, with Carmen drawn on its screen (tap to talk). Children
// (e.g. Home's hotspots) are positioned in % of the photo.
export default function MobileStage({ children }) {
  const carmen = useCarmenContext()

  return (
    <div className="mobile-stage">
      <img className="mobile-stage__bg" src={fondo} alt="" aria-hidden="true" />
      {carmen && (
        <Suspense fallback={null}>
          <CarmenScreen carmen={carmen} geometry={MOBILE_SCREEN} hint />
        </Suspense>
      )}
      {children}
    </div>
  )
}
