import { useEffect, useState } from 'react'
import './DesktopVideoPanel.css'
import DesktopOptionList from './DesktopOptionList.jsx'
import { notifyVideoOpened } from '../utils/notifyVideoOpened'

// Section panel shared by the desktop Salud and Seguridad screens: a DesktopOptionList
// whose buttons each open their video, centered over a darkened backdrop.
// `items`: [{ key, label, icons: [src], poster, src }] — `key` is what
// notifyVideoOpened reports, so it must match the mobile screen's ids.
export default function DesktopVideoPanel({ label, items }) {
  const [activeKey, setActiveKey] = useState(null)
  const activeItem = items.find((item) => item.key === activeKey)

  useEffect(() => {
    if (!activeKey) return
    function onKeyDown(event) {
      if (event.key === 'Escape') setActiveKey(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [activeKey])

  function openVideo(key) {
    setActiveKey(key)
    notifyVideoOpened(key)
  }

  return (
    <>
      <DesktopOptionList
        label={label}
        items={items}
        activeKey={activeKey}
        onSelect={(item) => openVideo(item.key)}
      />

      {activeItem && (
        <div className="desktop-video-panel__overlay" onClick={() => setActiveKey(null)}>
          <div
            className="desktop-video-panel__modal"
            role="dialog"
            aria-modal="true"
            aria-label={activeItem.label}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="desktop-video-panel__video">
              <video key={activeItem.key} poster={activeItem.poster} src={activeItem.src} controls playsInline autoPlay muted>
                Tu navegador no soporta video.
              </video>
            </div>
            <button type="button" className="desktop-video-panel__close" onClick={() => setActiveKey(null)} autoFocus>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
