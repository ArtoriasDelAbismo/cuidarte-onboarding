import { useNavigate } from 'react-router-dom'
import './Placeholder.css'

export default function Placeholder({ title, back = '/home' }) {
  const navigate = useNavigate()

  return (
    <div className="placeholder">
      <h1 className="placeholder__title">{title}</h1>
      <p className="placeholder__copy">Próximamente.</p>
      <button type="button" className="placeholder__back" onClick={() => navigate(back)}>
        Volver
      </button>
    </div>
  )
}
