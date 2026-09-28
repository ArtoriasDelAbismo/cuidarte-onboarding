import { createContext, useContext } from 'react'

// Carmen's shared connection (the value of useCarmen()) for the mobile
// screens, provided by MobileCarmenLayout so a conversation survives
// navigating between Home, Salud, Seguridad and Bienestar.
export const CarmenContext = createContext(null)

export function useCarmenContext() {
  return useContext(CarmenContext)
}
