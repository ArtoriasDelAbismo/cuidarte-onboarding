import './SeguridadDesktop.css'
import DesktopVideoPanel from './DesktopVideoPanel.jsx'
// Figma uses the same icon for caída and botón de pánico.
import iconCaidaPanico from '../assets/desktop/seguridad-caida-panico.svg'
import iconAberturas from '../assets/desktop/seguridad-aberturas.svg'
import iconAforo from '../assets/desktop/seguridad-aforo.svg'

import posterCaida from '../assets/seguridad/videos/alerta-caida.jpg'
import posterPanico from '../assets/seguridad/videos/boton-panico.jpg'
import posterAberturas from '../assets/seguridad/videos/apertura-aberturas.jpg'
import posterAforo from '../assets/seguridad/videos/aforo.jpg'

import videoCaida from '../assets/videos/seguridad/alerta-caida.mp4'
import videoPanico from '../assets/videos/seguridad/boton-panico.mp4'
import videoAberturas from '../assets/videos/seguridad/apertura-aberturas.mp4'
import videoAforo from '../assets/videos/seguridad/aforo.mp4'

// Keys match the mobile Seguridad screen so notifyVideoOpened reports the same ids.
const SECURITY_ITEMS = [
  { key: 'caida', label: 'Simular caída', icons: [iconCaidaPanico], poster: posterCaida, src: videoCaida },
  {
    key: 'panico',
    label: 'Simular botón de pánico',
    icons: [iconCaidaPanico],
    poster: posterPanico,
    src: videoPanico,
  },
  {
    key: 'aberturas',
    label: 'Consulta de estado de aberturas',
    icons: [iconAberturas],
    poster: posterAberturas,
    src: videoAberturas,
  },
  { key: 'aforo', label: 'Alerta de aforo', icons: [iconAforo], poster: posterAforo, src: videoAforo },
]

export default function SeguridadDesktop() {
  return <DesktopVideoPanel label="Seguridad" items={SECURITY_ITEMS} />
}
