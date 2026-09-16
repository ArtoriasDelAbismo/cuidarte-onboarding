import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Seguridad.css'

import blob from '../assets/home/blob-home.svg'
import logo from '../assets/home/logo-compact.svg'
import iconCaida from '../assets/seguridad/icon-caida.svg'
import iconPanico from '../assets/seguridad/icon-panico.svg'
import iconAberturas from '../assets/seguridad/icon-aberturas.svg'
import iconAforo from '../assets/seguridad/icon-aforo.svg'

import posterCaida from '../assets/seguridad/videos/alerta-caida.jpg'
import posterPanico from '../assets/seguridad/videos/boton-panico.jpg'
import posterAberturas from '../assets/seguridad/videos/apertura-aberturas.jpg'
import posterAforo from '../assets/seguridad/videos/aforo.jpg'

import videoCaida from '../assets/videos/seguridad/alerta-caida.mp4'
import videoPanico from '../assets/videos/seguridad/boton-panico.mp4'
import videoAberturas from '../assets/videos/seguridad/apertura-aberturas.mp4'
import videoAforo from '../assets/videos/seguridad/aforo.mp4'

import VideoModal from './VideoModal.jsx'
import AssistantOrb from './AssistantOrb.jsx'
import { notifyVideoOpened } from '../utils/notifyVideoOpened'

const SECURITY_CARDS = [
  { key: 'caida', label: 'Simular caída', icon: iconCaida, poster: posterCaida, src: videoCaida },
  { key: 'panico', label: 'Simular botón de pánico', icon: iconPanico, poster: posterPanico, src: videoPanico },
  { key: 'aberturas', label: 'Consulta de estado de aberturas', icon: iconAberturas, poster: posterAberturas, src: videoAberturas },
  { key: 'aforo', label: 'Alerta de aforo', icon: iconAforo, poster: posterAforo, src: videoAforo },
]

export default function Seguridad() {
  const navigate = useNavigate()
  const [activeKey, setActiveKey] = useState(null)
  const activeCard = SECURITY_CARDS.find((card) => card.key === activeKey)

  function openVideo(key) {
    setActiveKey(key)
    notifyVideoOpened(key)
  }

  return (
    <div className="seguridad">
      <img className="seguridad__blob" src={blob} alt="" aria-hidden="true" />
      <div className="seguridad__glow" aria-hidden="true" />
      <img className="seguridad__logo" src={logo} alt="Cuidarte.ia" />

      <AssistantOrb />

      <div className="seguridad__content">
        <div className="seguridad__list">
          {SECURITY_CARDS.map((card) => (
            <button
              key={card.key}
              type="button"
              className="seguridad__card"
              onClick={() => openVideo(card.key)}
            >
              <img src={card.icon} alt="" aria-hidden="true" />
              <span>{card.label}</span>
            </button>
          ))}
        </div>

        <button type="button" className="seguridad__back" onClick={() => navigate('/home')}>
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
