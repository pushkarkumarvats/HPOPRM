import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isDemoMode = accessToken?.startsWith('demo-token-');

  return (
    <div className="min-h-screen bg-background">
      {isDemoMode && (
        <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm">
          🎭 <strong>Demo Mode</strong> - You're exploring with simulated data!
        </div>
      )}
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
