import { useNavigate } from 'react-router-dom'
import './EncuentrosListo.css'

export default function EncuentrosListo() {
  const navigate = useNavigate()

  return (
    <div className="encuentros-listo">
      <div className="encuentros-listo__blob" aria-hidden="true" />
      <div className="encuentros-listo__glow" aria-hidden="true" />

      <div className="encuentros-listo__content">
        <p className="encuentros-listo__title">¡Listo!</p>
        <p className="encuentros-listo__body">
          Nos pondremos en contacto
          <br />
          a la brevedad.
        </p>
      </div>

      <button type="button" className="encuentros-listo__back" onClick={() => navigate('/bienestar')}>
        Volver
      </button>
    </div>
  )
}
