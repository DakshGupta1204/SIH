import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetAllBatchesQuery } from '@/store/slices/apiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, FileText, BarChart3, Search } from 'lucide-react';

export const LabDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: batchData, isLoading } = useGetAllBatchesQuery({ limit: 10 });
  
  const batches = batchData?.batches || [];
  const totalBatches = batchData?.pagination?.total || 0;

  return (
    <DashboardLayout title="Lab Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">Process batches and conduct quality testing for agricultural products.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <FlaskConical className="mr-2 h-5 w-5" />
                New Processing
              </CardTitle>
              <CardDescription>Add a new processing step to a batch</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/lab/processing/new">
                <Button className="w-full">
                  Start Processing
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <FileText className="mr-2 h-5 w-5" />
                Quality Test
              </CardTitle>
              <CardDescription>Conduct quality testing and upload certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/lab/quality-test">
                <Button className="w-full">
                  New Quality Test
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Batches</CardTitle>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? '...' : totalBatches}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? '...' : batches.filter(b => b.status === 'processing').length}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <div className="text-2xl font-bold text-primary flex items-center">
                <BarChart3 className="mr-1 h-5 w-5" />
                {isLoading ? '...' : batches.filter(b => b.status === 'distributed').length}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Batch Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Batch Lookup
            </CardTitle>
            <CardDescription>Search for batch details and processing history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Enter batch ID..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const batchId = (e.target as HTMLInputElement).value;
                    if (batchId.trim()) {
                      window.location.href = `/lab/batch/${batchId}`;
                    }
                  }
                }}
              />
              <Button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter batch ID..."]') as HTMLInputElement;
                  const batchId = input?.value;
                  if (batchId?.trim()) {
                    window.location.href = `/lab/batch/${batchId}`;
                  }
                }}
              >
                Search Batch
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Recent Batches</CardTitle>
            <CardDescription>Latest batches in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="bg-muted h-10 w-10 rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : batches.length > 0 ? (
              <div className="space-y-4">
                {batches.slice(0, 5).map((batch) => (
                  <Link
                    key={batch._id}
                    to={`/lab/batch/${batch._id}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FlaskConical className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Batch #{batch._id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          Status: {batch.status} | Scans: {batch.scanCount}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No batches found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};