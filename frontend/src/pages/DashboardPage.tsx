import { useQuery } from '@tanstack/react-query';
import { marketApi, contractsApi } from '../lib/api';
import { TrendingUp, FileText, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { data: prices } = useQuery({
    queryKey: ['prices'],
    queryFn: () => marketApi.getPrices(),
  });

  const { data: contracts } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractsApi.getAll(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Contracts</p>
              <p className="text-3xl font-bold">{contracts?.data?.length || 0}</p>
            </div>
            <FileText className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="p-6 bg-card rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Market Trend</p>
              <p className="text-3xl font-bold text-green-600">+2.5%</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="p-6 bg-card rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
              <p className="text-3xl font-bold">₹50,000</p>
            </div>
            <DollarSign className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Price Updates</h2>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Soybean</span>
            <span className="text-green-600">₹5,500 (+1.2%)</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Mustard</span>
            <span className="text-red-600">₹6,200 (-0.8%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
