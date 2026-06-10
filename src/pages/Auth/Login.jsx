import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import Spinner from '../../components/ui/Spinner'
import {
  HiEnvelope, HiLockClosed, HiXCircle, HiArrowRightOnRectangle
} from 'react-icons/hi2'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setErrorMsg('')
    try {
      const { data } = await authAPI.login(form)
      setAuth(data.data.token, data.data.usuario)
      navigate('/')
    } catch (err) {
      setErrorMsg(err.response?.data?.mensaje || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0C447C 0%, #185FA5 60%, #F1EFE8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: fadeSlideUp 0.4s cubic-bezier(.4,0,.2,1) both; }
        .input-field { transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .input-field:focus { border-color: #185FA5 !important; box-shadow: 0 0 0 3px rgba(24,95,165,0.12); outline: none; }
        .btn-submit { transition: all 0.18s cubic-bezier(.4,0,.2,1); }
        .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(24,95,165,0.35) !important; }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      {/* Decoración fondo */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: 40, left: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

      <div className="login-card" style={{
        background: '#fff', borderRadius: 24, padding: '40px 32px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(12,68,124,0.25)',
        position: 'relative', zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68,
            background: 'linear-gradient(135deg, #185FA5, #0C447C)',
            borderRadius: 20, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 14,
            boxShadow: '0 8px 24px rgba(24,95,165,0.3)',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 30 }}>U</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.5px' }}>
            UNAC Marketplace
          </h1>
          <p style={{ margin: '6px 0 0', color: '#888780', fontSize: 14 }}>
            Inicia sesión en tu cuenta
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: '#FCEBEB', color: '#A32D2D',
            padding: '12px 16px', borderRadius: 12, marginBottom: 20,
            fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #f5c6c6',
          }}>
            <HiXCircle size={18} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444441', marginBottom: 7 }}>
              Correo electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <HiEnvelope size={17} color="#B4B2A9" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input-field"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  borderRadius: 12, border: '1.5px solid #D3D1C7', fontSize: 15,
                }}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444441', marginBottom: 7 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <HiLockClosed size={17} color="#B4B2A9" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  borderRadius: 12, border: '1.5px solid #D3D1C7', fontSize: 15,
                }}
              />
            </div>
          </div>

          <button
            className="btn-submit"
            type="submit"
            disabled={cargando}
            style={{
              width: '100%', padding: '15px', borderRadius: 14,
              background: cargando ? '#B5D4F4' : 'linear-gradient(135deg, #185FA5, #0C447C)',
              color: '#fff', border: 'none', fontSize: 16,
              fontWeight: 700, cursor: cargando ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: cargando ? 'none' : '0 4px 14px rgba(24,95,165,0.3)',
            }}
          >
            {cargando
              ? <Spinner size={20} color="#fff" />
              : <><HiArrowRightOnRectangle size={20} /> Iniciar sesión</>
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#888780' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" style={{ color: '#185FA5', fontWeight: 700, textDecoration: 'none' }}>
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}