import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, DollarSign, FileText, User, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const navigation = [
  { name: 'dashboard', icon: Home, path: '/dashboard' },
  { name: 'market', icon: TrendingUp, path: '/market' },
  { name: 'trading', icon: DollarSign, path: '/trading' },
  { name: 'contracts', icon: FileText, path: '/contracts' },
  { name: 'profile', icon: User, path: '/profile' },
];

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="w-64 border-r bg-card p-4 hidden md:block">
      <nav className="space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{t(`nav.${item.name}`)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
