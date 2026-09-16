import './VideoModal.css'
import closeIcon from '../assets/salud/icon-close.svg'

export default function VideoModal({ poster, src, title, onClose }) {
  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div
        className="video-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="video-modal-frame">
          {src ? (
            <video className="video-modal-video" poster={poster} src={src} controls playsInline autoPlay muted>
              Tu navegador no soporta video.
            </video>
          ) : (
            <div className="video-modal-frame-placeholder">
              <img className="video-modal-poster" src={poster} alt="" aria-hidden="true" />
              <span className="video-modal-pending">Video próximamente</span>
            </div>
          )}
        </div>
        <button type="button" className="video-modal-close" onClick={onClose} aria-label="Cerrar">
          <img src={closeIcon} alt="" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
