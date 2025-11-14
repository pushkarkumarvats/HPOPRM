import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../lib/api';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.login(email, password);
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.login(demoEmail, 'Demo@123');
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Demo login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-lg border">
        <h1 className="text-3xl font-bold text-center mb-8">{t('auth.welcome')}</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Try Demo Accounts</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('farmer@demo.com')}
              disabled={loading}
              className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              👨‍🌾 Farmer Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('fpo@demo.com')}
              disabled={loading}
              className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              🏢 FPO Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('market@demo.com')}
              disabled={loading}
              className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              📈 Market Maker
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@demo.com')}
              disabled={loading}
              className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              ⚙️ Admin
            </button>
          </div>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            Demo accounts use password: <code className="px-1 py-0.5 bg-muted rounded">Demo@123</code>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('auth.newUser')}{' '}
          <Link to="/register" className="text-primary hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
