import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { publicacionesAPI } from '../../api/publicaciones.api'
import { useAuthStore } from '../../store/authStore'
import { formatPrecio, tiempoAtras, CATEGORIA_ESTILOS, inicialesNombre } from '../../utils/format'
import Navbar from '../../components/layout/Navbar'
import {
  HiMagnifyingGlass, HiHeart, HiOutlineHeart, HiStar,
  HiShieldCheck, HiChevronLeft, HiChevronRight,
  HiCamera, HiArrowRightOnRectangle, HiUser
} from 'react-icons/hi2'

const Skeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E8E7E1', background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <div style={{ height: 148, background: 'linear-gradient(90deg,#f0efeb 25%,#e8e7e1 50%,#f0efeb 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        <div style={{ padding: '12px' }}>
          <div style={{ height: 11, borderRadius: 8, background: '#E8E7E1', marginBottom: 8, width: '85%' }} />
          <div style={{ height: 16, borderRadius: 8, background: '#D3D1C7', width: '55%' }} />
        </div>
      </div>
    ))}
  </div>
)

const TarjetaPublicacion = ({ pub, onClick, favoritos, onToggleFav }) => {
  const cat = CATEGORIA_ESTILOS[pub.categorias?.slug] || CATEGORIA_ESTILOS.objetos
  const img = pub.imagenes_publicacion?.[0]?.url_cloudinary
  const esFav = favoritos.has(pub.id)

  return (
    <div
      onClick={() => onClick(pub.id)}
      style={{
        background: '#fff', borderRadius: 16,
        border: '1px solid rgba(211,209,199,0.6)',
        overflow: 'hidden', cursor: 'pointer',
        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s cubic-bezier(.4,0,.2,1), box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(24,95,165,0.14)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ position: 'relative', height: 148, background: '#F1EFE8', overflow: 'hidden' }}>
        {img
          ? <img src={img} alt={pub.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiCamera size={32} color="#B4B2A9" />
            </div>
        }
        <span style={{
          position: 'absolute', top: 8, left: 8,
          background: cat.bg, color: cat.text,
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          border: `1px solid ${cat.text}22`,
        }}>
          {cat.emoji} {pub.categorias?.nombre}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(pub.id) }}
          style={{
            position: 'absolute', top: 7, right: 7,
            background: 'rgba(255,255,255,0.9)', border: 'none',
            borderRadius: '50%', width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          {esFav
            ? <HiHeart size={16} color="#D4537E" />
            : <HiOutlineHeart size={16} color="#888780" />
          }
        </button>
      </div>
      <div style={{ padding: '11px 12px 13px' }}>
        <p style={{
          margin: 0, fontSize: 13, fontWeight: 600, color: '#2C2C2A',
          lineHeight: 1.35, display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {pub.titulo}
        </p>
        <p style={{ margin: '7px 0 0', fontSize: 16, fontWeight: 800, color: '#185FA5' }}>
          {formatPrecio(pub.precio)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <HiStar size={12} color="#F5A623" />
            <span style={{ fontSize: 11, color: '#888780', fontWeight: 500 }}>
              {pub.usuarios?.calificacion_promedio?.toFixed(1) || '5.0'}
            </span>
          </div>
          <span style={{ fontSize: 10, color: '#B4B2A9' }}>{tiempoAtras(pub.created_at)}</span>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#5F5E5A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {pub.usuarios?.nombre_completo}
        </p>
      </div>
    </div>
  )
}

export default function Feed() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuthStore()
  const [publicaciones, setPublicaciones] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [favoritos, setFavoritos] = useState(new Set())
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef(null)
  const ini = inicialesNombre(usuario?.nombre_completo)

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    publicacionesAPI.categorias()
      .then(({ data }) => setCategorias(data.data || []))
      .catch(() => {})
  }, [])

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const params = { pagina, limite: 12 }
      if (categoriaActiva) params.categoria = categoriaActiva
      if (busqueda) params.busqueda = busqueda
      const { data } = await publicacionesAPI.listar(params)
      setPublicaciones(data.data || [])
      setTotalPaginas(data.paginacion?.paginas || 1)
    } catch {
      setPublicaciones([])
    } finally {
      setLoading(false)
    }
  }, [categoriaActiva, busqueda, pagina])

  useEffect(() => {
    const t = setTimeout(cargar, busqueda ? 400 : 0)
    return () => clearTimeout(t)
  }, [cargar])

  const toggleFav = (id) => {
    setFavoritos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const todasCategorias = [{ id: null, nombre: 'Todo', slug: 'todo' }, ...categorias]

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .feed-grid > * { animation: fadeSlideUp 0.3s ease both; }
        .feed-grid > *:nth-child(1){animation-delay:0.00s}
        .feed-grid > *:nth-child(2){animation-delay:0.04s}
        .feed-grid > *:nth-child(3){animation-delay:0.08s}
        .feed-grid > *:nth-child(4){animation-delay:0.12s}
        .feed-grid > *:nth-child(5){animation-delay:0.16s}
        .feed-grid > *:nth-child(6){animation-delay:0.20s}
        .cat-chip { transition: all 0.18s cubic-bezier(.4,0,.2,1); }
        .cat-chip:hover { transform: translateY(-1px); }
        .search-input::placeholder { color: rgba(255,255,255,0.55); }
        .search-input:focus { outline: none; background: rgba(255,255,255,0.2) !important; }
        .menu-item:hover { background: #F1EFE8; }
        .avatar-btn:hover { background: rgba(255,255,255,0.3) !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F1EFE8', paddingBottom: 90 }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(160deg, #0C447C 0%, #185FA5 100%)',
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 2px 20px rgba(12,68,124,0.3)',
        }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>

              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>U</span>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: 17, lineHeight: 1.1 }}>UNAC</p>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>Marketplace</p>
                </div>
              </div>

              {/* Botones derecha */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {(usuario?.rol === 'moderador' || usuario?.rol === 'admin') && (
                  <button
                    onClick={() => navigate('/moderacion')}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 10, padding: '6px 12px',
                      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <HiShieldCheck size={14} />
                    Moderación
                  </button>
                )}

                {/* Avatar con menú desplegable */}
                <div ref={menuRef} style={{ position: 'relative' }}>
                  <button
                    className="avatar-btn"
                    onClick={() => setMenuAbierto(!menuAbierto)}
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: menuAbierto ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                      border: '2px solid rgba(255,255,255,0.35)',
                      color: '#fff', fontWeight: 800, fontSize: 13,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                    }}
                  >
                    {ini}
                  </button>

                  {/* Dropdown */}
                  {menuAbierto && (
                    <div style={{
                      position: 'absolute', top: 46, right: 0,
                      background: '#fff', borderRadius: 14,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                      border: '1px solid rgba(211,209,199,0.6)',
                      minWidth: 180, zIndex: 999,
                      overflow: 'hidden',
                      animation: 'fadeDown 0.18s ease',
                    }}>
                      {/* Info usuario */}
                      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #F1EFE8' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#2C2C2A' }}>
                          {usuario?.nombre_completo}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#888780' }}>
                          {usuario?.email}
                        </p>
                      </div>

                      {/* Mi perfil */}
                      <button
                        className="menu-item"
                        onClick={() => { setMenuAbierto(false); navigate('/perfil') }}
                        style={{
                          width: '100%', padding: '12px 16px',
                          border: 'none', background: 'none',
                          textAlign: 'left', fontSize: 13, color: '#2C2C2A',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                          borderBottom: '1px solid #F1EFE8',
                          transition: 'background 0.15s',
                        }}
                      >
                        <HiUser size={16} color="#185FA5" />
                        Mi perfil
                      </button>

                      {/* Cerrar sesión */}
                      <button
                        className="menu-item"
                        onClick={() => { logout(); navigate('/login') }}
                        style={{
                          width: '100%', padding: '12px 16px',
                          border: 'none', background: 'none',
                          textAlign: 'left', fontSize: 13, color: '#A32D2D',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                          transition: 'background 0.15s',
                        }}
                      >
                        <HiArrowRightOnRectangle size={16} color="#A32D2D" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buscador */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <HiMagnifyingGlass size={17} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="search-input"
                type="search"
                placeholder="Buscar productos o servicios..."
                value={busqueda}
                onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
                style={{
                  width: '100%', padding: '11px 12px 11px 38px',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12,
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: 14,
                  transition: 'background 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Filtros */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px', width: 'max-content' }}>
              {todasCategorias.map(c => {
                const activo = categoriaActiva === c.id
                return (
                  <button
                    key={c.id ?? 'todo'}
                    className="cat-chip"
                    onClick={() => { setCategoriaActiva(c.id); setPagina(1) }}
                    style={{
                      padding: '7px 18px', borderRadius: 24,
                      border: `1.5px solid ${activo ? '#fff' : 'rgba(255,255,255,0.3)'}`,
                      background: activo ? '#fff' : 'transparent',
                      color: activo ? '#185FA5' : '#fff',
                      fontSize: 13, fontWeight: activo ? 700 : 500,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      boxShadow: activo ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    }}
                  >
                    {CATEGORIA_ESTILOS[c.slug]?.emoji || ''} {c.nombre}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '18px 16px 0' }}>
          {loading ? <Skeleton /> : publicaciones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 20px', color: '#888780' }}>
              <HiMagnifyingGlass size={48} color="#D3D1C7" style={{ display: 'block', margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 700, color: '#444441', fontSize: 17, marginBottom: 6 }}>Sin resultados</p>
              <p style={{ fontSize: 13 }}>Intenta con otra categoría o búsqueda</p>
            </div>
          ) : (
            <>
              <div className="feed-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {publicaciones.map(p => (
                  <TarjetaPublicacion
                    key={p.id} pub={p}
                    onClick={id => navigate(`/publicacion/${id}`)}
                    favoritos={favoritos}
                    onToggleFav={toggleFav}
                  />
                ))}
              </div>

              {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 28, marginBottom: 8 }}>
                  <button
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    style={{
                      padding: '9px 18px', borderRadius: 12,
                      border: '1.5px solid #D3D1C7', background: '#fff',
                      color: pagina === 1 ? '#D3D1C7' : '#185FA5',
                      cursor: pagina === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <HiChevronLeft size={16} /> Anterior
                  </button>
                  <span style={{ fontSize: 14, color: '#5F5E5A', fontWeight: 600 }}>
                    {pagina} / {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                    style={{
                      padding: '9px 18px', borderRadius: 12,
                      border: '1.5px solid #D3D1C7', background: '#fff',
                      color: pagina === totalPaginas ? '#D3D1C7' : '#185FA5',
                      cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer',
                      fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    Siguiente <HiChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Navbar />
    </>
  )
}