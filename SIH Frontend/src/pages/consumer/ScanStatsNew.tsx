import { useParams } from 'react-router-dom';
import { useGetScanStatsQuery } from '@/store/slices/apiSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  Eye,
  Download,
  Share2
} from 'lucide-react';

export const ScanStats = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const { data: scanData, isLoading, error } = useGetScanStatsQuery(batchId || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-consumer flex items-center justify-center">
        <Card className="max-w-md shadow-elegant">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-consumer mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading scan analytics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !scanData) {
    return (
      <div className="min-h-screen bg-gradient-consumer flex items-center justify-center">
        <Card className="max-w-md shadow-elegant">
          <CardContent className="p-8 text-center">
            <QrCode className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">Data Not Found</h2>
            <p className="text-muted-foreground">
              Could not load scan statistics for batch: {batchId}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data for charts
  const mockDailyScans = [
    { date: '2024-01-01', scans: 12 },
    { date: '2024-01-02', scans: 19 },
    { date: '2024-01-03', scans: 8 },
    { date: '2024-01-04', scans: 15 },
    { date: '2024-01-05', scans: 22 },
    { date: '2024-01-06', scans: 11 },
    { date: '2024-01-07', scans: 17 },
  ];

  const mockLocationData = [
    { name: 'Urban Areas', value: 65, color: '#3B82F6' },
    { name: 'Suburban Areas', value: 25, color: '#10B981' },
    { name: 'Rural Areas', value: 10, color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-gradient-consumer">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Scan Analytics</h1>
          <div className="flex items-center justify-center space-x-2">
            <QrCode className="h-6 w-6 text-white" />
            <span className="text-white text-lg">Batch #{batchId}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-elegant text-center">
              <CardContent className="pt-6">
                <div className="bg-consumer/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="h-6 w-6 text-consumer" />
                </div>
                <div className="text-2xl font-bold text-consumer">{scanData.totalScans}</div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant text-center">
              <CardContent className="pt-6">
                <div className="bg-consumer/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-consumer" />
                </div>
                <div className="text-2xl font-bold text-consumer">{scanData.uniqueScans}</div>
                <p className="text-sm text-muted-foreground">Unique Scanners</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant text-center">
              <CardContent className="pt-6">
                <div className="bg-consumer/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-consumer" />
                </div>
                <div className="text-2xl font-bold text-consumer">
                  {scanData.analytics.averageScansPerDay}
                </div>
                <p className="text-sm text-muted-foreground">Avg/Day</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant text-center">
              <CardContent className="pt-6">
                <div className="bg-consumer/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-consumer" />
                </div>
                <div className="text-2xl font-bold text-consumer">
                  {scanData.analytics.firstScan ? 
                    Math.ceil((new Date().getTime() - new Date(scanData.analytics.firstScan).getTime()) / (1000 * 60 * 60 * 24)) 
                    : 0}
                </div>
                <p className="text-sm text-muted-foreground">Days Active</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Scans Chart */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-consumer">Daily Scan Activity</CardTitle>
              <CardDescription>Number of scans per day over the last week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDailyScans.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{day.date}</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="bg-consumer h-4 rounded"
                        style={{ width: `${(day.scans / 25) * 200}px` }}
                      ></div>
                      <span className="text-sm font-medium w-8">{day.scans}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Distribution */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-consumer flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Scan Locations
              </CardTitle>
              <CardDescription>Distribution of scans by location type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLocationData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: location.color }}
                      ></div>
                      <span className="text-sm">{location.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="h-4 rounded"
                        style={{ 
                          backgroundColor: location.color,
                          width: `${(location.value / 100) * 100}px`
                        }}
                      ></div>
                      <span className="text-sm font-medium w-8">{location.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-consumer">Recent Scan Activity</CardTitle>
              <CardDescription>Latest scans of this product</CardDescription>
            </CardHeader>
            <CardContent>
              {scanData.scanHistory && scanData.scanHistory.length > 0 ? (
                <div className="space-y-4">
                  {scanData.scanHistory.slice(0, 10).map((scan: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-consumer/10 p-2 rounded-lg">
                          <QrCode className="h-4 w-4 text-consumer" />
                        </div>
                        <div>
                          <p className="font-medium">Consumer Scan</p>
                          <p className="text-sm text-muted-foreground">
                            Scanned by {scan.scannedBy || 'Consumer'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(scan.scannedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(scan.scannedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No scan history available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button className="bg-consumer shadow-elegant">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button className="border-white text-white hover:bg-white hover:text-consumer bg-transparent border">
              <Share2 className="mr-2 h-4 w-4" />
              Share Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
