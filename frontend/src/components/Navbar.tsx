import { NavLink } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/ingredientes', label: 'Ingredientes' },
  { to: '/productos', label: 'Productos' },
]

function Navbar() {
  return (
    <nav className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <span className="font-semibold text-base tracking-tight text-white">
          Programación IV
        </span>
        <div className="flex gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
