import { forwardRef } from 'react'
import './DesktopOptionList.css'

// Column of section options drawn next to the DesktopScene nav (Salud,
// Seguridad, Bienestar). `items`: [{ key, label, icons: [src] }].
const DesktopOptionList = forwardRef(function DesktopOptionList({ label, items, activeKey, onSelect }, ref) {
  return (
    <ul className="desktop-option-list" ref={ref} aria-label={label}>
      {items.map((item) => (
        <li key={item.key}>
          <button
            type="button"
            className={`desktop-option-list__item${item.key === activeKey ? ' desktop-option-list__item--active' : ''}`}
            onClick={() => onSelect(item)}
            aria-pressed={item.key === activeKey}
          >
            <span className="desktop-option-list__icons">
              {item.icons.map((icon, index) => (
                <img key={index} src={icon} alt="" aria-hidden="true" width="32" height="32" />
              ))}
            </span>
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  )
})

export default DesktopOptionList
