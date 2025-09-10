import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '@/store';
import { useGetFarmerCollectionsQuery } from '@/store/slices/apiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Calendar, Package } from 'lucide-react';

export const FarmerCollections = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading } = useGetFarmerCollectionsQuery(user?._id || '');
  const collections = data?.collections || [];

  return (
    <DashboardLayout title="My Collections">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Harvest Collections</h2>
            <p className="text-muted-foreground">Manage and track your recorded harvests</p>
          </div>
          <Link to="/farmer/collection/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </Link>
        </div>

        {/* Collections Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card key={collection._id}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-primary">{collection.species}</CardTitle>
                    <Badge variant={
                      collection.verificationStatus === 'verified' ? 'default' :
                      collection.verificationStatus === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {collection.verificationStatus}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Image */}
                  {collection.image && (
                    <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={collection.image} 
                        alt={collection.species}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Package className="mr-2 h-4 w-4 text-primary" />
                      {collection.quantity} kg
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4 text-primary" />
                      {new Date(collection.harvestDate).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4 text-primary" />
                      {collection.gpsCoordinates.lat.toFixed(4)}, {collection.gpsCoordinates.lng.toFixed(4)}
                    </div>
                  </div>

                  {/* Actions */}
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">No Collections Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start recording your harvest collections to build your agricultural portfolio
              </p>
              <Link to="/farmer/collection/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Collection
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};