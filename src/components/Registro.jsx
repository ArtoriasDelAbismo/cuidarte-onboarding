import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Registro.css'
import { storeEmergencyPhones, storeNombre } from '../utils/notifyVideoOpened'

import blobHeader from '../assets/login/blob-loading.svg'

const SEXO_OPTIONS = ['Masculino', 'Femenino', 'No binario', 'Prefiero no especificar']

const EMPTY_FORM = {
  nombre: '',
  fechaNacimiento: '',
  sexo: '',
  telefono: '',
  telefonoEmergencia1: '',
  telefonoEmergencia2: '',
}

export default function Registro() {
  const [form, setForm] = useState(EMPTY_FORM)
  const navigate = useNavigate()

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    storeEmergencyPhones(form.telefonoEmergencia1, form.telefonoEmergencia2)
    storeNombre(form.nombre)
    // TODO: send `form` to cuidarte-ia-backend once the patient registration endpoint exists
    navigate('/cargando')
  }

  return (
    <div className="registro">
      <img className="registro__blob" src={blobHeader} alt="" aria-hidden="true" />
      <header className="registro__header">
        <h1 className="registro__title">
          ¡Que empiece <br /> tu experiencia!
        </h1>
      </header>

      <form className="registro__form" onSubmit={handleSubmit}>
        <input
          className="registro__field"
          type="text"
          placeholder="Nombre y Apellido"
          value={form.nombre}
          onChange={handleChange('nombre')}
          required
        />
        <input
          className="registro__field"
          type="date"
          placeholder="Fecha de nacimiento"
          value={form.fechaNacimiento}
          onChange={handleChange('fechaNacimiento')}
          required
        />
        <select
          className="registro__field registro__field--select"
          value={form.sexo}
          onChange={handleChange('sexo')}
          required
        >
          <option value="" disabled>
            Sexo
          </option>
          {SEXO_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <p className="registro__hint">
          Los teléfonos deben incluir código de país, ej: +5493425145645
        </p>
        <input
          className="registro__field"
          type="tel"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange('telefono')}
          pattern="\+?[0-9]{8,15}"
          title="Incluí el código de país, ej: +5493425145645"
          required
        />
        <input
          className="registro__field"
          type="tel"
          placeholder="Teléfono de emergencia 1"
          value={form.telefonoEmergencia1}
          onChange={handleChange('telefonoEmergencia1')}
          pattern="\+?[0-9]{8,15}"
          title="Incluí el código de país, ej: +5493425145645"
          required
        />
        <input
          className="registro__field"
          type="tel"
          placeholder="Teléfono de emergencia 2"
          value={form.telefonoEmergencia2}
          onChange={handleChange('telefonoEmergencia2')}
          pattern="\+?[0-9]{8,15}"
          title="Incluí el código de país, ej: +5493425145645"
        />

        <button type="submit" className="registro__submit">
          Continuar
        </button>
      </form>
    </div>
  )
}
