import DesktopVideoPanel from './DesktopVideoPanel.jsx'

import iconPresion from '../assets/desktop/vital-presion.svg'
import iconRitmo from '../assets/desktop/vital-ritmo.svg'
import iconOxigeno from '../assets/desktop/vital-oxigeno.svg'
import iconGlucosa from '../assets/desktop/vital-glucosa.svg'
import iconTemperatura from '../assets/desktop/vital-temperatura.svg'
import iconEcg from '../assets/desktop/vital-ecg.svg'

import posterPresionArterial from '../assets/salud/videos/presion-arterial.jpg'
import posterOxigeno from '../assets/salud/videos/oxigeno.jpg'
import posterGlucosa from '../assets/salud/videos/glucosa.jpg'
import posterTemperatura from '../assets/salud/videos/temperatura.jpg'
import posterEcg from '../assets/salud/videos/ecg.jpg'

import videoPresionArterial from '../assets/videos/salud/presion-arterial.mp4'
import videoOxigeno from '../assets/videos/salud/oxigeno.mp4'
import videoGlucosa from '../assets/videos/salud/glucosa.mp4'
import videoTemperatura from '../assets/videos/salud/temperatura.mp4'
import videoEcg from '../assets/videos/salud/ecg.mp4'

// Keys match the mobile Salud screen so notifyVideoOpened reports the same ids.
const VITALS = [
  {
    key: 'presion-arterial',
    label: 'Presión arterial & Ritmo cardíaco',
    icons: [iconPresion, iconRitmo],
    poster: posterPresionArterial,
    src: videoPresionArterial,
  },
  { key: 'oxigeno', label: 'Oxígeno en sangre', icons: [iconOxigeno], poster: posterOxigeno, src: videoOxigeno },
  { key: 'glucosa', label: 'Glucosa en sangre', icons: [iconGlucosa], poster: posterGlucosa, src: videoGlucosa },
  {
    key: 'temperatura',
    label: 'Temperatura',
    icons: [iconTemperatura],
    poster: posterTemperatura,
    src: videoTemperatura,
  },
  { key: 'ecg', label: 'Electrocardiograma', icons: [iconEcg], poster: posterEcg, src: videoEcg },
]

export default function SaludDesktop() {
  return <DesktopVideoPanel label="Salud" items={VITALS} />
}
