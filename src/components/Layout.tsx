import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const isFarmer = user?.role === 'FARMER' || user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      <main className={`flex-1 overflow-y-auto ${!hideNav ? 'pb-20' : ''}`}>
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 shadow-lg safe-bottom z-50">
          <div className="flex items-center justify-around px-2 py-2">
            <NavItem to="/" icon={<Home size={22} />} label="Главная" />
            <NavItem to="/orders" icon={<ShoppingBag size={22} />} label="Заказы" />
            {isFarmer && (
              <NavItem
                to="/farmer"
                icon={
                  <div className="bg-orange-500 rounded-full p-1.5 -mt-4 shadow-md border-4 border-white">
                    <Plus size={18} className="text-white" />
                  </div>
                }
                label="Создать"
                active={location.pathname.startsWith('/farmer')}
              />
            )}
            <NavItem to="/profile" icon={<User size={22} />} label="Профиль" />
          </div>
        </nav>
      )}
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ to, icon, label, active }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
          (isActive || active) ? 'text-green-600' : 'text-gray-400'
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}
