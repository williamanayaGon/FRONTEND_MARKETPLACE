import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { publicacionesAPI } from '../../api/publicaciones.api'
import { formatPrecio } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'
import {
  HiChevronLeft, HiInformationCircle, HiCamera,
  HiXCircle, HiCheckCircle, HiTag, HiListBullet,
  HiCurrencyDollar, HiDocumentText, HiPhone, HiPaperAirplane
} from 'react-icons/hi2'

export default function CrearPublicacion() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState({
    titulo: '', descripcion: '', precio: '',
    categoria_id: '', whatsapp_contacto: '', imagenes: []
  })
  const [imagenesPreview, setImagenesPreview] = useState([])
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [exito, setExito] = useState(false)

  useEffect(() => {
    publicacionesAPI.categorias()
      .then(({ data }) => setCategorias(data.data || []))
  }, [])

  const handleImagen = (e) => {
    const archivos = Array.from(e.target.files)
    if (form.imagenes.length + archivos.length > 5) {
      setErrorMsg('Máximo 5 fotos')
      return
    }
    archivos.forEach(archivo => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagenesPreview(prev => [...prev, ev.target.result])
        setForm(prev => ({ ...prev, imagenes: [...prev.imagenes, ev.target.result] }))
      }
      reader.readAsDataURL(archivo)
    })
  }

  const eliminarImagen = (i) => {
    setImagenesPreview(prev => prev.filter((_, idx) => idx !== i))
    setForm(prev => ({ ...prev, imagenes: prev.imagenes.filter((_, idx) => idx !== i) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.imagenes.length === 0) { setErrorMsg('Agrega al menos una foto'); return }
    setCargando(true)
    setErrorMsg('')
    try {
      await publicacionesAPI.crear({
        ...form,
        precio: Number(form.precio),
        categoria_id: Number(form.categoria_id),
      })
      setExito(true)
    } catch (err) {
      setErrorMsg(err.response?.data?.mensaje || 'Error creando publicación')
    } finally {
      setCargando(false)
    }
  }

  if (exito) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0C447C 0%, #185FA5 60%, #F1EFE8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '48px 32px',
        textAlign: 'center', maxWidth: 360, width: '100%',
        boxShadow: '0 20px 60px rgba(12,68,124,0.25)',
        animation: 'fadeSlideUp 0.4s ease both',
      }}>
        <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ width: 72, height: 72, background: '#EAF3DE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <HiCheckCircle size={40} color="#3B6D11" />
        </div>
        <h2 style={{ margin: '0 0 10px', color: '#2C2C2A', fontSize: 22, fontWeight: 800 }}>¡Publicación enviada!</h2>
        <p style={{ color: '#888780', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Tu publicación está en revisión. Te notificaremos por correo cuando sea aprobada.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: '15px',
            background: 'linear-gradient(135deg, #185FA5, #0C447C)',
            color: '#fff', border: 'none', borderRadius: 14,
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(24,95,165,0.3)',
          }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .input-crear { transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .input-crear:focus { border-color: #185FA5 !important; box-shadow: 0 0 0 3px rgba(24,95,165,0.12); outline: none; }
        .foto-add:hover { border-color: #185FA5 !important; background: #E6F1FB !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F1EFE8', paddingBottom: 40 }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(160deg, #0C447C 0%, #185FA5 100%)',
          padding: '16px', position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 2px 20px rgba(12,68,124,0.3)',
        }}>
          <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10, width: 36, height: 36, color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <HiChevronLeft size={20} />
            </button>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700 }}>Nueva publicación</h1>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

          {/* Aviso moderación */}
          <div style={{
            background: '#FAEEDA', border: '1px solid #EF9F27',
            borderRadius: 14, padding: '12px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'flex-start', gap: 10,
            animation: 'fadeSlideUp 0.3s ease both',
          }}>
            <HiInformationCircle size={18} color="#854F0B" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 13, color: '#633806', lineHeight: 1.5 }}>
              Tu publicación será revisada por un moderador antes de aparecer en el feed.
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: '#FCEBEB', color: '#A32D2D',
              padding: '12px 16px', borderRadius: 12, marginBottom: 16,
              fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid #f5c6c6',
              animation: 'fadeSlideUp 0.3s ease both',
            }}>
              <HiXCircle size={18} />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Fotos */}
            <div style={{
              background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              border: '1px solid rgba(211,209,199,0.5)',
              animation: 'fadeSlideUp 0.35s ease both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <HiCamera size={18} color="#185FA5" />
                <p style={{ margin: 0, fontWeight: 700, color: '#2C2C2A', fontSize: 15 }}>
                  Fotos <span style={{ color: '#888780', fontWeight: 400, fontSize: 13 }}>({imagenesPreview.length}/5)</span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {imagenesPreview.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }} />
                    <button
                      type="button"
                      onClick={() => eliminarImagen(i)}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#E24B4A', border: '2px solid #fff',
                        color: '#fff', fontSize: 12, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imagenesPreview.length < 5 && (
                  <label
                    className="foto-add"
                    style={{
                      width: 80, height: 80,
                      border: '2px dashed #D3D1C7', borderRadius: 12,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#888780', fontSize: 11, gap: 5,
                      transition: 'all 0.15s', background: '#F8F7F4',
                    }}
                  >
                    <HiCamera size={22} color="#B4B2A9" />
                    Agregar
                    <input type="file" accept="image/*" multiple onChange={handleImagen} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {/* Campos */}
            <div style={{
              background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              border: '1px solid rgba(211,209,199,0.5)',
              display: 'flex', flexDirection: 'column', gap: 18,
              animation: 'fadeSlideUp 0.4s ease both',
            }}>

              {/* Título */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <HiTag size={15} color="#185FA5" />
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444441' }}>Título</label>
                </div>
                <input
                  className="input-crear"
                  type="text" placeholder="Ej: Libro de Cálculo II — 8va Ed."
                  value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                  required maxLength={100}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #D3D1C7', fontSize: 15 }}
                />
              </div>

              {/* Categoría */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <HiListBullet size={15} color="#185FA5" />
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444441' }}>Categoría</label>
                </div>
                <select
                  className="input-crear"
                  value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #D3D1C7', fontSize: 15, background: '#fff' }}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Precio */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <HiCurrencyDollar size={15} color="#185FA5" />
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444441' }}>Precio en COP</label>
                </div>
                <input
                  className="input-crear"
                  type="number" placeholder="0" min="0"
                  value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #D3D1C7', fontSize: 15 }}
                />
                {form.precio && (
                  <p style={{ margin: '5px 0 0', fontSize: 13, color: '#185FA5', fontWeight: 700 }}>
                    {formatPrecio(Number(form.precio))}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <HiDocumentText size={15} color="#185FA5" />
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444441' }}>Descripción</label>
                </div>
                <textarea
                  className="input-crear"
                  placeholder="Describe tu producto o servicio..."
                  value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  required rows={4}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #D3D1C7', fontSize: 15, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {/* WhatsApp */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <HiPhone size={15} color="#185FA5" />
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444441' }}>
                    WhatsApp <span style={{ color: '#888780', fontWeight: 400 }}>(opcional)</span>
                  </label>
                </div>
                <input
                  className="input-crear"
                  type="tel" placeholder="3001234567"
                  value={form.whatsapp_contacto} onChange={e => setForm({ ...form, whatsapp_contacto: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #D3D1C7', fontSize: 15 }}
                />
                <p style={{ margin: '5px 0 0', fontSize: 12, color: '#888780' }}>
                  Visible para compradores y moderador
                </p>
              </div>
            </div>

            <button
              type="submit" disabled={cargando}
              style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: cargando ? '#B5D4F4' : 'linear-gradient(135deg, #185FA5, #0C447C)',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: cargando ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: cargando ? 'none' : '0 4px 14px rgba(24,95,165,0.3)',
                transition: 'all 0.18s',
              }}
            >
              {cargando
                ? <><Spinner size={20} color="#fff" /> Enviando...</>
                : <><HiPaperAirplane size={18} /> Enviar a revisión</>
              }
            </button>
          </form>
        </div>
      </div>
    </>
  )
}