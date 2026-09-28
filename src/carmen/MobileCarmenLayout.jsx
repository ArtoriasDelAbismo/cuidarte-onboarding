import { Outlet } from 'react-router-dom'
import './MobileCarmenLayout.css'
import { CarmenContext } from './carmenContext'
import { useCarmen } from './useCarmen'

// Mobile counterpart of DesktopScene's Carmen: one connection shared by the
// screens showing the device photo (each draws Carmen on it via MobileStage).
// Leaving these routes (e.g. to Encuentros) unmounts this and hangs up.
export default function MobileCarmenLayout() {
  const carmen = useCarmen()

  return (
    <CarmenContext.Provider value={carmen}>
      <Outlet />
      {carmen.error && (
        <p className="mobile-carmen__error" role="alert">
          {carmen.error}
        </p>
      )}
    </CarmenContext.Provider>
  )
}
