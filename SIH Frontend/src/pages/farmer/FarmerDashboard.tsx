import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetFarmerCollectionsQuery } from '@/store/slices/apiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, TrendingUp, MapPin } from 'lucide-react';

export const FarmerDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading } = useGetFarmerCollectionsQuery(user?._id || '');
  const collections = data?.collections || [];

  const stats = {
    totalCollections: collections.length,
    recentCollections: collections.slice(0, 3),
    totalQuantity: collections.reduce((sum, collection) => sum + collection.quantity, 0),
  };

  return (
    <DashboardLayout title="Farmer Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">Manage your agricultural collections and track your harvest data.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Plus className="mr-2 h-5 w-5" />
                New Collection
              </CardTitle>
              <CardDescription>Record a new harvest collection</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/farmer/collection/new">
                <Button className="w-full">
                  Start Collection
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Package className="mr-2 h-5 w-5" />
                View Collections
              </CardTitle>
              <CardDescription>Browse all your harvest records</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/farmer/collections">
                <Button variant="outline" className="w-full">
                  View All Collections
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Collections</CardTitle>
              <div className="text-2xl font-bold text-primary">{stats.totalCollections}</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Quantity</CardTitle>
              <div className="text-2xl font-bold text-primary">{stats.totalQuantity} kg</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <div className="text-2xl font-bold text-primary flex items-center">
                <TrendingUp className="mr-1 h-5 w-5" />
                +12%
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Collections */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Recent Collections</CardTitle>
            <CardDescription>Your latest harvest records</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading collections...</div>
            ) : stats.recentCollections.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCollections.map((collection) => (
                  <div key={collection._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{collection.species}</p>
                        <p className="text-sm text-muted-foreground">{new Date(collection.harvestDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{collection.quantity} kg</p>
                      <p className="text-sm text-muted-foreground">
                        {collection.gpsCoordinates.lat.toFixed(4)}, {collection.gpsCoordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No collections yet. <Link to="/farmer/collection/new" className="text-primary hover:underline">Create your first collection</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};