'use client';

import { useState } from 'react';
import { Download, Filter } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { PerformanceMetrics } from '@/features/analytics/performance-metrics';
import { FinancialMetrics } from './financial-metrics';
import { DriverPerformance } from './driver-performance';
import { VehicleUtilization } from './vehicle-utilization';

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Track key performance indicators and business metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$128,450</div>
            <p className="text-muted-foreground flex items-center text-xs">
              <span className="mr-1 text-green-500">↑ 12%</span> vs previous
              period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42,587</div>
            <p className="text-muted-foreground flex items-center text-xs">
              <span className="mr-1 text-green-500">↑ 8%</span> vs previous
              period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$26,842</div>
            <p className="text-muted-foreground flex items-center text-xs">
              <span className="mr-1 text-red-500">↑ 5%</span> vs previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On-Time Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-muted-foreground flex items-center text-xs">
              <span className="mr-1 text-green-500">↑ 2%</span> vs previous
              period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="drivers">Driver Performance</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Utilization</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key operational performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMetrics timeRange={''} performanceData={[]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Metrics</CardTitle>
              <CardDescription>
                Revenue, costs, and profitability analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialMetrics
                timeRange={timeRange}
                financialData={[]}
                expenseBreakdown={[]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Driver Performance</CardTitle>
              <CardDescription>
                Driver productivity and safety metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DriverPerformance
                timeRange={timeRange}
                driverPerformanceMetrics={[]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Utilization</CardTitle>
              <CardDescription>
                Vehicle usage and maintenance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleUtilization timeRange={timeRange} vehicleData={[]} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
