import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ofertasAPI } from '../../api/ofertas.api'
import { formatPrecio, tiempoAtras } from '../../utils/format'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import {
  HiCheckCircle, HiXCircle, HiArrowsRightLeft,
  HiPaperAirplane, HiInboxArrowDown, HiClock,
  HiInformationCircle, HiCamera
} from 'react-icons/hi2'

const ESTADO_ESTILOS = {
  pendiente:    { bg: '#FAEEDA', color: '#854F0B', label: 'Pendiente' },
  aceptada:     { bg: '#EAF3DE', color: '#3B6D11', label: 'Aceptada' },
  rechazada:    { bg: '#FCEBEB', color: '#A32D2D', label: 'Rechazada' },
  caducada:     { bg: '#F1EFE8', color: '#5F5E5A', label: 'Caducada' },
  contraoferta: { bg: '#E6F1FB', color: '#185FA5', label: 'Contraoferta' },
}

const Badge = ({ estado }) => {
  const e = ESTADO_ESTILOS[estado] || ESTADO_ESTILOS.pendiente
  return (
    <span style={{
      background: e.bg, color: e.color,
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      border: `1px solid ${e.color}22`,
    }}>
      {e.label}
    </span>
  )
}

const BtnWhatsApp = ({ numero, texto, nombre }) => {
  if (!numero) return null
  const msg = encodeURIComponent(texto)
  return (
    <a
      href={`https://wa.me/57${numero.replace(/\D/g, '')}?text=${msg}`}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: '#25D366', color: '#fff',
        padding: '8px 14px', borderRadius: 10,
        fontSize: 13, fontWeight: 700, textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.123 1.526 5.858L0 24l6.335-1.5A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.214-3.727.882.897-3.618-.235-.372A9.818 9.818 0 1112 21.818z"/>
      </svg>
      {nombre ? `WhatsApp a ${nombre.split(' ')[0]}` : 'WhatsApp'}
    </a>
  )
}

export default function Ofertas() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('recibidas')
  const [recibidas, setRecibidas] = useState([])
  const [enviadas, setEnviadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [accionando, setAccionando] = useState(null)
  const [contraofertaInput, setContraofertaInput] = useState({})
  const [mensaje, setMensaje] = useState('')

  const cargar = async () => {
    setLoading(true)
    try {
      const [r, e] = await Promise.all([ofertasAPI.recibidas(), ofertasAPI.enviadas()])
      setRecibidas(r.data.data || [])
      setEnviadas(e.data.data || [])
    } catch {
      setRecibidas([])
      setEnviadas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const accion = async (fn, id, extra) => {
    setAccionando(id)
    setMensaje('')
    try {
      const { data } = await fn(id, extra)
      setMensaje(data.mensaje || 'Listo')
      setTimeout(() => setMensaje(''), 4000)
      cargar()
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error')
    } finally {
      setAccionando(null)
    }
  }

  // TARJETA RECIBIDA — vista del VENDEDOR
  const TarjetaRecibida = ({ oferta }) => {
    const cargando = accionando === oferta.id
    const pub = oferta.publicaciones
    const comprador = oferta.usuarios // comprador con su whatsapp

    return (
      <div style={{
        background: '#fff', borderRadius: 18, padding: '16px',
        marginBottom: 12, border: '1px solid rgba(211,209,199,0.5)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        animation: 'fadeSlideUp 0.3s ease both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <p
              style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#2C2C2A', cursor: 'pointer' }}
              onClick={() => navigate(`/publicacion/${pub?.id}`)}
            >
              {pub?.titulo}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888780' }}>
              Comprador: {comprador?.nombre_completo}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
            <Badge estado={oferta.estado} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginTop: 4 }}>
              <HiClock size={11} color="#B4B2A9" />
              <span style={{ fontSize: 11, color: '#B4B2A9' }}>{tiempoAtras(oferta.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Precios */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#F1EFE8', borderRadius: 12, padding: '10px 14px', marginBottom: 12,
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 10, color: '#888780' }}>Original</p>
            <p style={{ margin: 0, fontSize: 13, color: '#888780', textDecoration: 'line-through', fontWeight: 600 }}>
              {formatPrecio(pub?.precio)}
            </p>
          </div>
          <HiArrowsRightLeft size={14} color="#D3D1C7" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 10, color: '#888780' }}>Oferta</p>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#185FA5' }}>
              {formatPrecio(oferta.monto_ofertado)}
            </p>
          </div>
          {oferta.monto_contraoferta && (
            <>
              <HiArrowsRightLeft size={14} color="#D3D1C7" />
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 10, color: '#888780' }}>Contraoferta</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#854F0B' }}>
                  {formatPrecio(oferta.monto_contraoferta)}
                </p>
              </div>
            </>
          )}
        </div>

        {oferta.estado === 'pendiente' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
              <button
                onClick={() => accion(ofertasAPI.aceptar, oferta.id)}
                disabled={cargando}
                style={{
                  padding: '10px 6px', borderRadius: 12, border: 'none',
                  background: '#EAF3DE', color: '#3B6D11', fontWeight: 700, fontSize: 12,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                {cargando ? <Spinner size={13} color="#3B6D11" /> : <><HiCheckCircle size={14} /> Aceptar</>}
              </button>
              <button
                onClick={() => setContraofertaInput(p => ({ ...p, [oferta.id]: p[oferta.id] != null ? null : '' }))}
                disabled={cargando}
                style={{
                  padding: '10px 6px', borderRadius: 12, border: 'none',
                  background: '#E6F1FB', color: '#185FA5', fontWeight: 700, fontSize: 12,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <HiArrowsRightLeft size={14} /> Contra
              </button>
              <button
                onClick={() => accion(ofertasAPI.rechazar, oferta.id)}
                disabled={cargando}
                style={{
                  padding: '10px 6px', borderRadius: 12, border: 'none',
                  background: '#FCEBEB', color: '#A32D2D', fontWeight: 700, fontSize: 12,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <HiXCircle size={14} /> Rechazar
              </button>
            </div>

            {contraofertaInput[oferta.id] != null && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  placeholder="Tu precio"
                  value={contraofertaInput[oferta.id]}
                  onChange={e => setContraofertaInput(p => ({ ...p, [oferta.id]: e.target.value }))}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 12,
                    border: '1.5px solid #D3D1C7', fontSize: 14, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#185FA5'}
                  onBlur={e => e.target.style.borderColor = '#D3D1C7'}
                />
                <button
                  onClick={() => accion(ofertasAPI.contraoferta, oferta.id, contraofertaInput[oferta.id])}
                  disabled={cargando}
                  style={{
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #185FA5, #0C447C)',
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <HiPaperAirplane size={15} /> Enviar
                </button>
              </div>
            )}
          </>
        )}

        {/* Oferta aceptada — vendedor ve WhatsApp del comprador */}
        {oferta.estado === 'aceptada' && (
          <div style={{
            background: '#EAF3DE', borderRadius: 12, padding: '12px 14px',
            border: '1px solid #c3e6cb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3B6D11', fontSize: 13, fontWeight: 600 }}>
                <HiCheckCircle size={16} />
                ¡Oferta aceptada!
              </div>
              <BtnWhatsApp
                numero={comprador?.whatsapp_numero}
                nombre={comprador?.nombre_completo}
                texto={`Hola ${comprador?.nombre_completo}, acepté tu oferta para "${pub?.titulo}". ¡Coordinemos la entrega!`}
              />
            </div>
            {!comprador?.whatsapp_numero && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#5B8A3C' }}>
                El comprador no tiene WhatsApp configurado. Espera que te contacte.
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  // TARJETA ENVIADA — vista del COMPRADOR
  const TarjetaEnviada = ({ oferta }) => {
    const pub = oferta.publicaciones
    const img = pub?.imagenes_publicacion?.[0]?.url_cloudinary
    const vendedor = pub?.usuarios // vendedor con su whatsapp

    return (
      <div style={{
        background: '#fff', borderRadius: 18, padding: '16px',
        marginBottom: 12, border: '1px solid rgba(211,209,199,0.5)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        animation: 'fadeSlideUp 0.3s ease both',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {img
            ? <img src={img} alt="" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
            : <div style={{ width: 60, height: 60, borderRadius: 12, background: '#F1EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <HiCamera size={22} color="#B4B2A9" />
              </div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#2C2C2A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pub?.titulo}
              </p>
              <Badge estado={oferta.estado} />
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: '#888780' }}>Tu oferta</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#185FA5' }}>{formatPrecio(oferta.monto_ofertado)}</p>
              </div>
              {oferta.monto_contraoferta && (
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: '#888780' }}>Contraoferta</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#854F0B' }}>{formatPrecio(oferta.monto_contraoferta)}</p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
              <HiClock size={11} color="#B4B2A9" />
              <span style={{ fontSize: 11, color: '#B4B2A9' }}>{tiempoAtras(oferta.created_at)}</span>
            </div>
          </div>
        </div>

        {oferta.estado === 'contraoferta' && (
          <div style={{
            marginTop: 12, background: '#E6F1FB', borderRadius: 12,
            padding: '10px 14px', fontSize: 13, color: '#185FA5',
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #b8d4f0',
          }}>
            <HiArrowsRightLeft size={15} />
            El vendedor propone <strong>{formatPrecio(oferta.monto_contraoferta)}</strong>
          </div>
        )}

        {/* Oferta aceptada — comprador ve WhatsApp del vendedor */}
        {oferta.estado === 'aceptada' && (
          <div style={{
            marginTop: 12, background: '#EAF3DE', borderRadius: 12,
            padding: '12px 14px', border: '1px solid #c3e6cb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3B6D11', fontSize: 13, fontWeight: 600 }}>
                <HiCheckCircle size={16} />
                ¡Tu oferta fue aceptada!
              </div>
              <BtnWhatsApp
                numero={vendedor?.whatsapp_numero}
                nombre={vendedor?.nombre_completo}
                texto={`Hola ${vendedor?.nombre_completo}, mi oferta para "${pub?.titulo}" fue aceptada. ¿Coordinamos la entrega?`}
              />
            </div>
            {!vendedor?.whatsapp_numero && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#5B8A3C' }}>
                El vendedor no tiene WhatsApp. Espera que te contacte directamente.
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#F1EFE8', paddingBottom: 90 }}>

        <div style={{
          background: 'linear-gradient(160deg, #0C447C 0%, #185FA5 100%)',
          padding: '20px 16px 0', position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 2px 20px rgba(12,68,124,0.3)',
        }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <h1 style={{ margin: '0 0 12px', color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Mis ofertas
            </h1>
            <div style={{
              background: 'rgba(255,255,255,0.12)', borderRadius: 12,
              padding: '9px 14px', marginBottom: 12,
              fontSize: 12, color: 'rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <HiInformationCircle size={15} />
              Las alertas llegan a tu correo — entra aquí para responder
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
              background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 4,
              marginBottom: 16,
            }}>
              {[
                { key: 'recibidas', label: 'Recibidas', count: recibidas.length, Icon: HiInboxArrowDown },
                { key: 'enviadas', label: 'Enviadas', count: enviadas.length, Icon: HiPaperAirplane },
              ].map(({ key, label, count, Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  style={{
                    padding: '9px', borderRadius: 10, border: 'none',
                    background: tab === key ? '#fff' : 'transparent',
                    color: tab === key ? '#185FA5' : 'rgba(255,255,255,0.8)',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Icon size={15} />
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>
          {mensaje && (
            <div style={{
              background: '#EAF3DE', color: '#3B6D11',
              padding: '12px 16px', borderRadius: 12, marginBottom: 16,
              fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid #c3e6cb',
            }}>
              <HiCheckCircle size={16} />
              {mensaje}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Spinner size={36} />
            </div>
          ) : tab === 'recibidas' ? (
            recibidas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <HiInboxArrowDown size={52} color="#D3D1C7" style={{ display: 'block', margin: '0 auto 14px' }} />
                <p style={{ fontWeight: 700, color: '#2C2C2A', fontSize: 16, marginBottom: 6 }}>Sin ofertas recibidas</p>
                <p style={{ fontSize: 13, color: '#888780' }}>Cuando alguien haga una oferta en tus publicaciones aparecerá aquí</p>
              </div>
            ) : recibidas.map(o => <TarjetaRecibida key={o.id} oferta={o} />)
          ) : (
            enviadas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <HiPaperAirplane size={52} color="#D3D1C7" style={{ display: 'block', margin: '0 auto 14px' }} />
                <p style={{ fontWeight: 700, color: '#2C2C2A', fontSize: 16, marginBottom: 6 }}>Sin ofertas enviadas</p>
                <p style={{ fontSize: 13, color: '#888780' }}>Explora el feed y haz ofertas en publicaciones que te interesen</p>
              </div>
            ) : enviadas.map(o => <TarjetaEnviada key={o.id} oferta={o} />)
          )}
        </div>
      </div>
      <Navbar />
    </>
  )
}