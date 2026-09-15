import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Salud.css'

import blob from '../assets/home/blob-home.svg'
import logo from '../assets/home/logo-compact.svg'
import iconPresionArterial from '../assets/salud/icon-presion-arterial.svg'
import iconRitmoCardiaco from '../assets/salud/icon-ritmo-cardiaco.svg'
import iconOxigeno from '../assets/salud/icon-oxigeno.svg'
import iconGlucosa from '../assets/salud/icon-glucosa.svg'
import iconTemperatura from '../assets/salud/icon-temperatura.svg'
import iconEcg from '../assets/salud/icon-ecg.svg'

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

import VideoModal from './VideoModal.jsx'
import { notifyVideoOpened } from '../utils/notifyVideoOpened'

const WIDE_CARD = {
  key: 'presion-arterial',
  label: 'Presión arterial & Ritmo cardíaco',
  poster: posterPresionArterial,
  src: videoPresionArterial,
}

const VITAL_CARDS = [
  { key: 'oxigeno', label: 'Oxígeno en sangre', icon: iconOxigeno, poster: posterOxigeno, src: videoOxigeno },
  { key: 'glucosa', label: 'Glucosa en sangre', icon: iconGlucosa, poster: posterGlucosa, src: videoGlucosa },
  { key: 'temperatura', label: 'Temperatura', icon: iconTemperatura, poster: posterTemperatura, src: videoTemperatura },
  { key: 'ecg', label: 'ECG', icon: iconEcg, poster: posterEcg, src: videoEcg },
]

const ALL_CARDS = [WIDE_CARD, ...VITAL_CARDS]

export default function Salud() {
  const navigate = useNavigate()
  const [activeKey, setActiveKey] = useState(null)
  const activeCard = ALL_CARDS.find((card) => card.key === activeKey)

  function openVideo(key) {
    setActiveKey(key)
    notifyVideoOpened(key)
  }

  return (
    <div className="salud">
      <img className="salud__blob" src={blob} alt="" aria-hidden="true" />
      <div className="salud__glow" aria-hidden="true" />
      <img className="salud__logo" src={logo} alt="Cuidarte.ia" />

      <div className="salud__content">
        <button
          type="button"
          className="salud__card salud__card--wide"
          onClick={() => openVideo(WIDE_CARD.key)}
        >
          <div className="salud__card-icons">
            <img src={iconPresionArterial} alt="" aria-hidden="true" />
            <img src={iconRitmoCardiaco} alt="" aria-hidden="true" />
          </div>
          <span>Presión arterial &amp; Ritmo cardíaco</span>
        </button>

        <div className="salud__grid">
          {VITAL_CARDS.map((card) => (
            <button
              key={card.key}
              type="button"
              className="salud__card"
              onClick={() => openVideo(card.key)}
            >
              <img src={card.icon} alt="" aria-hidden="true" />
              <span>{card.label}</span>
            </button>
          ))}
        </div>

        <button type="button" className="salud__back" onClick={() => navigate('/home')}>
          Volver
        </button>
      </div>

      {activeCard && (
        <VideoModal
          poster={activeCard.poster}
          src={activeCard.src}
          title={activeCard.label}
          onClose={() => setActiveKey(null)}
        />
      )}
    </div>
  )
}
