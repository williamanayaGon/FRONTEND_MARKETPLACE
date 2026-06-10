import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { inicialesNombre } from '../../utils/format'
import {
  HiHome, HiOutlineHome,
  HiHeart, HiOutlineHeart,
  HiPlus,
  HiChatBubbleLeftRight, HiOutlineChatBubbleLeftRight,
  HiUser, HiOutlineUser
} from 'react-icons/hi2'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario } = useAuthStore()
  const ini = inicialesNombre(usuario?.nombre_completo)
  const ruta = location.pathname

  const tabs = [
    { label: 'Inicio',    IconOn: HiHome,                  IconOff: HiOutlineHome,                 path: '/' },
    { label: 'Favoritos', IconOn: HiHeart,                  IconOff: HiOutlineHeart,                path: '/favoritos' },
    { label: 'Publicar',  IconOn: HiPlus,                   IconOff: HiPlus,                        path: '/crear', especial: true },
    { label: 'Ofertas',   IconOn: HiChatBubbleLeftRight,    IconOff: HiOutlineChatBubbleLeftRight,  path: '/ofertas' },
    { label: 'Perfil',    IconOn: HiUser,                   IconOff: HiOutlineUser,                 path: '/perfil' },
  ]

  return (
    <>
      <style>{`
        .nav-btn { transition: all 0.2s cubic-bezier(.4,0,.2,1); }
        .nav-btn:active { transform: scale(0.88); }
        .nav-especial { transition: all 0.2s cubic-bezier(.4,0,.2,1); }
        .nav-especial:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(24,95,165,0.4) !important; }
        .nav-especial:active { transform: scale(0.93); }
      `}</style>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(211,209,199,0.6)',
        display: 'flex', justifyContent: 'space-around',
        alignItems: 'center', padding: '10px 0 16px',
        zIndex: 200,
      }}>
        {tabs.map(({ label, IconOn, IconOff, path, especial }) => {
          const activo = ruta === path
          const Icono = activo ? IconOn : IconOff

          if (especial) return (
            <button
              key={label}
              className="nav-especial"
              onClick={() => navigate(path)}
              style={{
                background: 'linear-gradient(135deg, #185FA5, #0C447C)',
                border: 'none', borderRadius: '50%',
                width: 52, height: 52,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
                boxShadow: '0 4px 14px rgba(24,95,165,0.35)',
                marginBottom: 4,
              }}
              aria-label={label}
            >
              <Icono size={24} />
            </button>
          )

          return (
            <button
              key={label}
              className="nav-btn"
              onClick={() => navigate(path)}
              style={{
                background: 'none', border: 'none',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3,
                cursor: 'pointer', padding: '0 12px',
                color: activo ? '#185FA5' : '#888780',
              }}
              aria-label={label}
            >
              <div style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 28,
              }}>
                {activo && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: '#E6F1FB', borderRadius: 10,
                    transition: 'all 0.2s',
                  }} />
                )}
                <Icono size={20} style={{ position: 'relative', zIndex: 1 }} />
              </div>
              <span style={{
                fontSize: 10, fontWeight: activo ? 700 : 500,
                letterSpacing: '0.2px',
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}