const API_URL = import.meta.env.VITE_API_URL || 'https://cuidarte-ia-backend-production.up.railway.app'

const EMERGENCY_PHONES_STORAGE_KEY = 'cuidarte:emergency-phones'
const NOMBRE_STORAGE_KEY = 'cuidarte:nombre'

// Alerts go to the emergency contacts, not the patient's own phone.
// `telefonoEmergencia2` is optional on the form, so it may be omitted.
export function storeEmergencyPhones(telefonoEmergencia1, telefonoEmergencia2) {
  const phones = [telefonoEmergencia1, telefonoEmergencia2].filter(Boolean)
  sessionStorage.setItem(EMERGENCY_PHONES_STORAGE_KEY, JSON.stringify(phones))
}

export function storeNombre(nombre) {
  sessionStorage.setItem(NOMBRE_STORAGE_KEY, nombre)
}

// Fire-and-forget: a failed notification shouldn't block the video from opening.
export function notifyVideoOpened(videoKey) {
  const raw = sessionStorage.getItem(EMERGENCY_PHONES_STORAGE_KEY)
  const phones = raw ? JSON.parse(raw) : []
  if (phones.length === 0) return
  const name = sessionStorage.getItem(NOMBRE_STORAGE_KEY)

  phones.forEach((phone) => {
    fetch(`${API_URL}/api/whatsapp/video-opened`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, videoKey, name }),
    }).catch((err) => console.error('[whatsapp] notifyVideoOpened failed', err))
  })
}
