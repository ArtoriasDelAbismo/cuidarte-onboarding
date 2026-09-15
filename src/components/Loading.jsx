import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Loading.css'

import blob from '../assets/login/blob-loading.svg'
import loadingDots from '../assets/login/loading-dots.svg'

const REDIRECT_MS = 1500

export default function Loading() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/home', { replace: true }), REDIRECT_MS)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="loading">
      <img className="loading__blob" src={blob} alt="" aria-hidden="true" />
      <img className="loading__dots" src={loadingDots} alt="Cargando" />
    </div>
  )
}
