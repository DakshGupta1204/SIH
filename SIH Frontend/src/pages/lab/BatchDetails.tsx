import { useParams } from 'react-router-dom';
import { useGetBatchDetailsQuery } from '@/store/slices/apiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  MapPin, 
  Calendar, 
  User, 
  Factory, 
  FlaskConical, 
  QrCode,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export const BatchDetails = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const { data: batchData, isLoading, error, refetch } = useGetBatchDetailsQuery(batchId || '');

  if (isLoading) {
    return (
      <DashboardLayout title="Batch Details">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading batch details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !batchData) {
    return (
      <DashboardLayout title="Batch Details">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">Batch Not Found</h2>
            <p className="text-muted-foreground mb-4">
              Could not find batch with ID: {batchId}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const { batch, collection, processing, qualityTests } = batchData;

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'created': return 'default';
      case 'processing': return 'secondary';
      case 'tested': return 'default';
      case 'distributed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <DashboardLayout title="Batch Details">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-primary">Batch #{batch._id.slice(-6)}</h2>
            <p className="text-muted-foreground">Complete batch traceability information</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={getStatusVariant(batch.status)}>
              {batch.status}
            </Badge>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* QR Code & Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <QrCode className="mr-2 h-6 w-6" />
              Batch Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Batch ID</p>
                <p className="font-medium">{batch._id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusVariant(batch.status)}>
                  {batch.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(batch.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Package className="mr-2 h-6 w-6" />
              Farm Collections
            </CardTitle>
            <CardDescription>Source collections included in this batch</CardDescription>
          </CardHeader>
          <CardContent>
            {collection ? (
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg">{collection.species}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center">
                            <Package className="mr-1 h-4 w-4" />
                            {collection.quantity} kg
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(collection.harvestDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-4 w-4" />
                          {collection.gpsCoordinates.lat.toFixed(4)}, {collection.gpsCoordinates.lng.toFixed(4)}
                        </div>
                      </div>

                      <div className="bg-primary/10 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <CheckCircle className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm font-medium text-primary">
                            Verification Status: {collection.verificationStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {collection.image && (
                      <div>
                        <img 
                          src={collection.image} 
                          alt={collection.species}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No collection found for this batch
              </p>
            )}
          </CardContent>
        </Card>

        {/* Processing Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Factory className="mr-2 h-6 w-6" />
              Processing History
            </CardTitle>
            <CardDescription>All processing steps applied to this batch</CardDescription>
          </CardHeader>
          <CardContent>
            {processing.length > 0 ? (
              <div className="space-y-4">
                {processing.map((step, index) => (
                  <div key={step._id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{step.stepType}</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          {new Date(step.date).toLocaleString()}
                        </div>
                      </div>
                      
                      {Object.keys(step.metadata).length > 0 && (
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(step.metadata).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="text-muted-foreground capitalize">{key}:</span>
                              <span className="ml-1 font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No processing steps recorded yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quality Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <FlaskConical className="mr-2 h-6 w-6" />
              Quality Test Results
            </CardTitle>
            <CardDescription>Laboratory testing and certification results</CardDescription>
          </CardHeader>
          <CardContent>
            {qualityTests.length > 0 ? (
              <div className="space-y-6">
                {qualityTests.map((test) => (
                  <div key={test._id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">
                        Test conducted on {new Date(test.testDate).toLocaleDateString()}
                      </h4>
                      <Badge variant={test.status === 'pass' ? 'default' : 'destructive'}>
                        {test.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{test.moisture}%</p>
                        <p className="text-sm text-muted-foreground">Moisture Content</p>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{test.pesticideLevel}</p>
                        <p className="text-sm text-muted-foreground">Pesticide Level (ppm)</p>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">DNA Verified</p>
                      </div>
                    </div>

                    <div className="bg-primary/10 p-4 rounded-lg mb-4">
                      <h5 className="font-medium text-primary mb-2">DNA Analysis Result</h5>
                      <p className="text-sm text-primary/80">{test.dnaResult}</p>
                    </div>

                    {test.certificateFile && (
                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Quality Certificate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No quality tests performed yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
