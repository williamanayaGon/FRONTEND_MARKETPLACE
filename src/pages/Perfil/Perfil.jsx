import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../api/auth.api'
import { publicacionesAPI } from '../../api/publicaciones.api'
import { useAuthStore } from '../../store/authStore'
import { formatPrecio, tiempoAtras, inicialesNombre } from '../../utils/format'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import {
  HiArrowRightOnRectangle, HiPencilSquare, HiCheckCircle,
  HiXCircle, HiStar, HiSquares2X2, HiClipboardDocumentList,
  HiPlus, HiPhone, HiEnvelope, HiShieldCheck,
  HiClock, HiUser, HiShieldExclamation
} from 'react-icons/hi2'

const ESTADO_MOD = {
  aprobada:   { bg: '#EAF3DE', color: '#3B6D11', label: 'Aprobado' },
  pendiente:  { bg: '#FAEEDA', color: '#854F0B', label: 'En revisión' },
  rechazada:  { bg: '#FCEBEB', color: '#A32D2D', label: 'Rechazado' },
  correccion: { bg: '#E6F1FB', color: '#185FA5', label: 'Corrección' },
}

export default function Perfil() {
  const navigate = useNavigate()
  const { setAuth, logout } = useAuthStore()
  const [tab, setTab] = useState('publicaciones')
  const [perfil, setPerfil] = useState(null)
  const [misPubs, setMisPubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const ini = inicialesNombre(perfil?.nombre_completo)

  useEffect(() => {
    Promise.all([
      authAPI.perfil(),
      publicacionesAPI.misPublicaciones()
    ]).then(([p, pubs]) => {
      setPerfil(p.data.data)
      setForm(p.data.data)
      setMisPubs(pubs.data.data || [])
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const guardarPerfil = async () => {
    setGuardando(true)
    try {
      const { data } = await authAPI.actualizarPerfil({
        nombre_completo: form.nombre_completo,
        whatsapp_numero: form.whatsapp_numero,
        whatsapp_visible: form.whatsapp_visible,
      })
      setPerfil(data.data)
      setAuth(localStorage.getItem('token'), data.data)
      setEditando(false)
      setMensaje('Perfil actualizado correctamente')
      setTimeout(() => setMensaje(''), 3000)
    } catch {
      setMensaje('Error actualizando perfil')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1EFE8' }}>
      <Spinner size={40} />
    </div>
  )

  const RolIcono = perfil?.rol === 'moderador'
    ? <HiShieldCheck size={13} />
    : perfil?.rol === 'admin'
      ? <HiShieldExclamation size={13} />
      : <HiUser size={13} />

  const rolTexto = perfil?.rol === 'moderador' ? 'Moderador' : perfil?.rol === 'admin' ? 'Admin' : 'Usuario'

  const stats = [
    { label: 'Reputación', value: perfil?.calificacion_promedio?.toFixed(1) || '0.0', esRep: true },
    { label: 'Publicaciones', value: misPubs.length, esRep: false },
    { label: 'Rol', value: rolTexto, esRep: false },
  ]

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .perfil-card { animation: fadeSlideUp 0.35s ease both; }
        .perfil-card:nth-child(2) { animation-delay: 0.05s; }
        .perfil-card:nth-child(3) { animation-delay: 0.10s; }
        .perfil-card:nth-child(4) { animation-delay: 0.15s; }
        .tab-btn { transition: all 0.2s cubic-bezier(.4,0,.2,1); }
        .pub-item { transition: box-shadow 0.18s, transform 0.18s; }
        .pub-item:hover { box-shadow: 0 4px 16px rgba(24,95,165,0.10); transform: translateY(-1px); }
        .btn-logout { transition: all 0.18s; }
        .btn-logout:hover { background: rgba(255,255,255,0.25) !important; }
        .btn-editar { transition: all 0.18s; }
        .btn-editar:hover { opacity: 0.85; }
        input:focus { border-color: #185FA5 !important; box-shadow: 0 0 0 3px rgba(24,95,165,0.12); }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F1EFE8', paddingBottom: 90 }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(160deg, #0C447C 0%, #185FA5 100%)',
          padding: '28px 16px 40px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h1 style={{ margin: 0, color: '#fff', fontSize: 20, fontWeight: 700 }}>Mi perfil</h1>
              <button
                className="btn-logout"
                onClick={() => { logout(); navigate('/login') }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 10, padding: '7px 14px',
                  color: '#fff', fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500,
                }}
              >
                <HiArrowRightOnRectangle size={16} />
                Cerrar sesión
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #378ADD, #185FA5)',
                border: '3px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 26, flexShrink: 0,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}>
                {ini}
              </div>
              <div>
                <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: 20 }}>{perfil?.nombre_completo}</p>
                <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{perfil?.email}</p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff', fontSize: 11, fontWeight: 600,
                  padding: '3px 12px', borderRadius: 20,
                }}>
                  {RolIcono}
                  {rolTexto}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 24 }}>
              {stats.map(({ label, value, esRep }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14, padding: '14px 10px', textAlign: 'center',
                }}>
                  <p style={{
                    margin: 0, color: '#fff', fontWeight: 700, fontSize: 17,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    {esRep && <HiStar size={16} color="#F5A623" />}
                    {value}
                  </p>
                  <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '-20px auto 0', padding: '0 16px' }}>

          {mensaje && (
            <div className="perfil-card" style={{
              background: mensaje.includes('Error') ? '#FCEBEB' : '#EAF3DE',
              color: mensaje.includes('Error') ? '#A32D2D' : '#3B6D11',
              padding: '12px 16px', borderRadius: 12, marginBottom: 12,
              fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
              border: `1px solid ${mensaje.includes('Error') ? '#f5c6c6' : '#c3e6cb'}`,
            }}>
              {mensaje.includes('Error') ? <HiXCircle size={18} /> : <HiCheckCircle size={18} />}
              {mensaje}
            </div>
          )}

          {/* Card información */}
          <div className="perfil-card" style={{
            background: '#fff', borderRadius: 20, padding: '20px', marginBottom: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(211,209,199,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editando ? 18 : 0 }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#2C2C2A', fontSize: 15 }}>Información personal</p>
              <button
                className="btn-editar"
                onClick={() => editando ? guardarPerfil() : setEditando(true)}
                style={{
                  background: editando ? 'linear-gradient(135deg, #185FA5, #0C447C)' : 'none',
                  border: editando ? 'none' : '1.5px solid #185FA5',
                  borderRadius: 10, padding: '7px 16px',
                  color: editando ? '#fff' : '#185FA5',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: editando ? '0 2px 8px rgba(24,95,165,0.25)' : 'none',
                }}
              >
                {guardando
                  ? <Spinner size={14} color="#fff" />
                  : editando
                    ? <><HiCheckCircle size={15} /> Guardar</>
                    : <><HiPencilSquare size={15} /> Editar</>
                }
              </button>
            </div>

            {editando ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Nombre completo', key: 'nombre_completo', placeholder: 'Tu nombre', icon: <HiUser size={16} /> },
                  { label: 'WhatsApp', key: 'whatsapp_numero', placeholder: '3001234567', icon: <HiPhone size={16} /> },
                ].map(({ label, key, placeholder, icon }) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#888780', display: 'block', marginBottom: 6 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#B4B2A9' }}>{icon}</span>
                      <input
                        value={form[key] || ''}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        style={{
                          width: '100%', padding: '11px 12px 11px 36px',
                          borderRadius: 12, border: '1.5px solid #D3D1C7',
                          fontSize: 14, outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                ))}
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.whatsapp_visible || false}
                    onChange={e => setForm({ ...form, whatsapp_visible: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#185FA5' }}
                  />
                  <span style={{ fontSize: 13, color: '#444441' }}>Mostrar WhatsApp públicamente</span>
                </label>
                <button onClick={() => setEditando(false)} style={{ background: 'none', border: 'none', color: '#888780', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
                  Cancelar
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 14 }}>
                {[
                  { label: 'Correo', value: perfil?.email, icon: <HiEnvelope size={15} /> },
                  { label: 'WhatsApp', value: perfil?.whatsapp_numero || 'No configurado', icon: <HiPhone size={15} /> },
                  { label: 'Visibilidad', value: perfil?.whatsapp_visible ? 'Público' : 'Privado', icon: <HiShieldCheck size={15} /> },
                ].map(({ label, value, icon }, i, arr) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '11px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid #F1EFE8' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888780' }}>
                      {icon}
                      <span style={{ fontSize: 13 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#2C2C2A', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="perfil-card" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 4, background: '#fff', borderRadius: 16,
            padding: 5, marginBottom: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(211,209,199,0.5)',
          }}>
            {[
              { key: 'publicaciones', label: `Publicaciones (${misPubs.length})`, Icon: HiSquares2X2 },
              { key: 'historial', label: 'Historial', Icon: HiClipboardDocumentList },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                className="tab-btn"
                onClick={() => setTab(key)}
                style={{
                  padding: '11px', borderRadius: 12, border: 'none',
                  background: tab === key ? 'linear-gradient(135deg, #185FA5, #0C447C)' : 'transparent',
                  color: tab === key ? '#fff' : '#888780',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: tab === key ? '0 2px 8px rgba(24,95,165,0.25)' : 'none',
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {tab === 'publicaciones' && (
            misPubs.length === 0 ? (
              <div className="perfil-card" style={{
                textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 20,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(211,209,199,0.5)',
              }}>
                <HiSquares2X2 size={48} color="#D3D1C7" style={{ display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 700, color: '#2C2C2A', marginBottom: 4, fontSize: 16 }}>Sin publicaciones aún</p>
                <p style={{ fontSize: 13, color: '#888780', marginBottom: 20 }}>Crea tu primera publicación y empieza a vender</p>
                <button
                  onClick={() => navigate('/crear')}
                  style={{
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #185FA5, #0C447C)',
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontWeight: 700, cursor: 'pointer', fontSize: 14,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 4px 12px rgba(24,95,165,0.3)',
                  }}
                >
                  <HiPlus size={18} />
                  Crear publicación
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {misPubs.map((pub, i) => {
                  const estado = ESTADO_MOD[pub.estado_mod] || ESTADO_MOD.pendiente
                  const img = pub.imagenes_publicacion?.[0]?.url_cloudinary
                  return (
                    <div key={pub.id} className="pub-item perfil-card" style={{
                      background: '#fff', borderRadius: 16, padding: '14px 16px',
                      animationDelay: `${i * 0.05}s`,
                      border: '1px solid rgba(211,209,199,0.5)',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    }}>
                      {img
                        ? <img src={img} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 56, height: 56, borderRadius: 12, background: '#F1EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <HiUser size={24} color="#B4B2A9" />
                          </div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#2C2C2A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pub.titulo}
                          </p>
                          <span style={{
                            background: estado.bg, color: estado.color,
                            fontSize: 11, fontWeight: 700, padding: '3px 10px',
                            borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
                            border: `1px solid ${estado.color}22`,
                          }}>
                            {estado.label}
                          </span>
                        </div>
                        <p style={{ margin: '5px 0 0', fontSize: 16, fontWeight: 800, color: '#185FA5' }}>
                          {formatPrecio(pub.precio)}
                        </p>
                        {pub.motivo_rechazo && (
                          <p style={{ margin: '5px 0 0', fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '5px 10px', borderRadius: 8 }}>
                            {pub.motivo_rechazo}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, color: '#888780' }}>
                          <HiClock size={12} />
                          <span style={{ fontSize: 11 }}>{tiempoAtras(pub.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {tab === 'historial' && (
            <div className="perfil-card" style={{
              textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 20,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(211,209,199,0.5)',
            }}>
              <HiClipboardDocumentList size={48} color="#D3D1C7" style={{ display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 700, color: '#2C2C2A', fontSize: 16, marginBottom: 4 }}>Historial de transacciones</p>
              <p style={{ fontSize: 13, color: '#888780' }}>Aquí aparecerán tus compras y ventas completadas</p>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </>
  )
}