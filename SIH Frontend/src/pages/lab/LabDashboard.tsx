import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetAllBatchesQuery, useGetRecentProcessingQuery, useGetRecentQualityTestsQuery } from '@/store/slices/apiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, FileText, BarChart3, Search } from 'lucide-react';
import React from 'react';

export const LabDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: batchData, isLoading } = useGetAllBatchesQuery({ limit: 10 });
  const { data: recentProcData, refetch: refetchProcessing, isFetching: fetchingProc } = useGetRecentProcessingQuery({ limit: 5 });
  const { data: recentQualData, refetch: refetchQuality, isFetching: fetchingQual } = useGetRecentQualityTestsQuery({ limit: 5 });

  const batches: any[] = Array.isArray(batchData)
    ? (batchData as any[])
    : ((batchData as any)?.batches || (batchData as any)?.data || []);
  const totalBatches = (batchData as any)?.pagination?.total || batches.length || 0;
  const recentProcessing = recentProcData?.data || [];
  const recentQuality = recentQualData?.data || [];

  const refreshAll = () => {
    refetchProcessing();
    refetchQuality();
  };

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
                  {isLoading ? '...' : batches.filter(b => ['distributed','completed','finalized'].includes(b.status)).length}
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
                    key={batch._id || batch.id}
                    to={`/lab/batch/${batch._id || batch.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FlaskConical className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Batch #{(batch._id || batch.id || '').slice(-6)}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          Status: {batch.status || 'n/a'} | Scans: {batch.scanCount ?? 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : ''}
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

        {/* Recent Processing & Quality Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-primary">Recent Processing Steps</CardTitle>
                <CardDescription>Latest processor submissions</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={refetchProcessing} disabled={fetchingProc}>
                {fetchingProc ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent>
              {fetchingProc && recentProcessing.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : recentProcessing.length > 0 ? (
                <ul className="space-y-3">
                  {recentProcessing.slice(0,5).map(step => (
                    <li key={step._id} className="text-sm border p-3 rounded-md flex flex-col">
                      <span className="font-medium">{(step as any).stepName || (step as any).stepType || 'Processing Step'}</span>
                      <span className="text-xs text-muted-foreground">Batch: {(step.batchId || '').toString().slice(-6)} • {step.createdAt ? new Date(step.createdAt).toLocaleString() : ''}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No processing steps found</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-primary">Recent Quality Tests</CardTitle>
                <CardDescription>Latest lab reports</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={refetchQuality} disabled={fetchingQual}>
                {fetchingQual ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent>
              {fetchingQual && recentQuality.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : recentQuality.length > 0 ? (
                <ul className="space-y-3">
                  {recentQuality.slice(0,5).map(test => (
                    <li key={test._id} className="text-sm border p-3 rounded-md flex flex-col">
                      <span className="font-medium">{(test as any).testType || 'Quality Test'}</span>
                      <span className="text-xs text-muted-foreground">Batch: {(test.batchId || '').toString().slice(-6)} • {test.createdAt ? new Date(test.createdAt).toLocaleString() : ''}</span>
                      {(test as any).result && <span className="text-xs">Result: {(test as any).result}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No quality tests found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};