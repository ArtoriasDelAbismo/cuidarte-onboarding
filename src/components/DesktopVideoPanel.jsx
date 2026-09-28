import { useEffect, useRef, useState } from 'react'
import './DesktopVideoPanel.css'
import DesktopOptionList from './DesktopOptionList.jsx'
import { notifyVideoOpened } from '../utils/notifyVideoOpened'

// Section panel shared by the desktop Salud and Seguridad screens: a DesktopOptionList
// whose buttons each open their video in a glass frame.
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
      <DesktopOptionList
        ref={panelRef}
        label={label}
        items={items}
        activeKey={activeKey}
        onSelect={(item) => toggleVideo(item.key)}
      />

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
