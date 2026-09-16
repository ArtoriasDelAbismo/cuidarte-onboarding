import { useNavigate } from 'react-router-dom'
import './Encuentros.css'

import fotoPintura from '../assets/entretenimiento/encuentros/pintura.jpg'
import fotoCena from '../assets/entretenimiento/encuentros/cena.jpg'
import fotoCafe from '../assets/entretenimiento/encuentros/cafe.jpg'
import fotoBingo from '../assets/entretenimiento/encuentros/bingo.jpg'
import blobEncuentros from '../assets/entretenimiento/encuentros/blob-encuentros.svg'

const CAROUSEL_PHOTOS = [fotoPintura, fotoCena, fotoCafe, fotoBingo]

export default function Encuentros() {
  const navigate = useNavigate()

  return (
    <div className="encuentro">
      <div className="encuentro__blob" aria-hidden="true" />
      <img className="encuentro__shape" src={blobEncuentros} alt="" aria-hidden="true" />

      <div className="encuentro__carousel" aria-hidden="true">
        {[...CAROUSEL_PHOTOS, ...CAROUSEL_PHOTOS].map((photo, index) => (
          <div
            key={index}
            className="encuentro__carousel-frame"
            style={{ backgroundImage: `url(${photo})` }}
          />
        ))}
      </div>

      <div className="encuentro__glow" aria-hidden="true" />

      <div className="encuentro__content">
        <h1 className="encuentro__headline">
          <span className="encuentro__headline-accent">Planifiquemos</span>{' '}
          <span className="encuentro__headline-underline">una cena</span>{' '}
          <span className="encuentro__headline-accent">con</span>{' '}
          <span className="encuentro__headline-underline">mi pareja</span>
        </h1>

        <button
          type="button"
          className="encuentro__cta"
          onClick={() => navigate('/bienestar/encuentros/planificar')}
        >
          Continuar
        </button>
      </div>

      <button type="button" className="encuentro__back" onClick={() => navigate('/bienestar')}>
        Volver
      </button>
    </div>
  )
}
