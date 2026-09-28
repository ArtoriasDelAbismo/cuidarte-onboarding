import { useEffect, useRef, useState } from 'react'
import './DesktopVideoPanel.css'
import { notifyVideoOpened } from '../utils/notifyVideoOpened'

// Section panel shared by the desktop Salud and Seguridad screens: a column of
// buttons next to the DesktopScene nav, each opening its video in a glass frame.
// `items`: [{ key, label, icons: [src], poster, src }] — `key` is what
// notifyVideoOpened reports, so it must match the mobile screen's ids.
export default function DesktopVideoPanel({ label, items }) {
  const [activeKey, setActiveKey] = useState(null)
  const activeItem = items.find((item) => item.key === activeKey)
  const panelRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!activeKey) return
    function onPointerDown(event) {
      const inside = panelRef.current?.contains(event.target) || videoRef.current?.contains(event.target)
      if (!inside) setActiveKey(null)
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setActiveKey(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [activeKey])

  function toggleVideo(key) {
    if (key === activeKey) {
      setActiveKey(null)
      return
    }
    setActiveKey(key)
    notifyVideoOpened(key)
  }

  return (
    <>
      <ul className="desktop-video-panel__list" ref={panelRef} aria-label={label}>
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className={`desktop-video-panel__item${item.key === activeKey ? ' desktop-video-panel__item--active' : ''}`}
              onClick={() => toggleVideo(item.key)}
              aria-pressed={item.key === activeKey}
            >
              <span className="desktop-video-panel__icons">
                {item.icons.map((icon, index) => (
                  <img key={index} src={icon} alt="" aria-hidden="true" width="32" height="32" />
                ))}
              </span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      {activeItem && (
        <div className="desktop-video-panel__video" ref={videoRef} role="dialog" aria-label={activeItem.label}>
          <video key={activeItem.key} poster={activeItem.poster} src={activeItem.src} controls playsInline autoPlay muted>
            Tu navegador no soporta video.
          </video>
        </div>
      )}
    </>
  )
}
