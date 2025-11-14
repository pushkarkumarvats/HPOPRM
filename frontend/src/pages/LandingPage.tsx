import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">HPOPRM</h1>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-accent">Login</Link>
          <Link to="/register" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl font-bold mb-6">Oilseed Hedging Platform</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Secure your oilseed prices with AI-powered forecasting and blockchain-verified contracts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold hover:opacity-90"
            >
              Start Hedging Now
            </Link>
            <Link
              to="/login"
              className="inline-block px-8 py-4 border-2 border-primary text-primary rounded-lg text-lg font-semibold hover:bg-primary/10"
            >
              Try Demo 🚀
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No registration needed • Explore all features instantly
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-card rounded-lg border">
            <TrendingUp className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Price Forecasting</h3>
            <p className="text-muted-foreground">
              Machine learning models predict price trends to help you make informed decisions
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Blockchain Security</h3>
            <p className="text-muted-foreground">
              Smart contracts on Polygon ensure transparent and secure forward contracts
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Trading</h3>
            <p className="text-muted-foreground">
              Simulated trading engine for risk-free hedging strategy testing
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
