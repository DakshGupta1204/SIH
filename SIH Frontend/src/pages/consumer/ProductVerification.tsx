import { useParams } from 'react-router-dom';
import { useVerifyProductQuery } from '@/store/slices/apiSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, MapPin, Calendar, FlaskConical, Package, CheckCircle, Clock, Leaf } from 'lucide-react';

export const ProductVerification = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const { data: provenanceData, isLoading, error } = useVerifyProductQuery(qrCode || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying product authenticity...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !provenanceData?.verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">Verification Failed</h2>
            <p className="text-muted-foreground">
              Could not verify product with QR code: {qrCode}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { batch, provenance, timeline } = provenanceData;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Product Verification</h1>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span className="text-foreground text-lg">Verified Authentic</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Batch Information */}
          <Card>
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center text-primary">
                <Shield className="mr-2 h-6 w-6" />
                Batch Information
              </CardTitle>
              <CardDescription>
                Product traceability information secured by blockchain technology
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{batch.scanCount}</p>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary capitalize">{batch.status}</p>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{batch.qrCode}</p>
                  <p className="text-sm text-muted-foreground">QR Code</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Created</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collection Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Leaf className="mr-2 h-6 w-6" />
                Farm Collection Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {provenance.collection.image && (
                  <img 
                    src={provenance.collection.image} 
                    alt={provenance.collection.species}
                    className="w-full max-w-md mx-auto h-48 object-cover rounded-lg"
                  />
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{provenance.collection.species}</h3>
                    <Badge variant={
                      provenance.collection.verificationStatus === 'verified' ? 'default' :
                      provenance.collection.verificationStatus === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {provenance.collection.verificationStatus}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Package className="mr-2 h-4 w-4" />
                      {provenance.collection.quantity} kg harvested
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(provenance.collection.harvestDate).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {provenance.collection.gpsCoordinates.lat.toFixed(4)}, {provenance.collection.gpsCoordinates.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Steps */}
          {provenance.processing.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Clock className="mr-2 h-6 w-6" />
                  Processing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {provenance.processing.map((step, index) => (
                    <div key={step._id} className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-2 rounded-full mt-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium capitalize">{step.stepType}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(step.date).toLocaleString()}
                        </p>
                        {Object.keys(step.metadata).length > 0 && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {Object.entries(step.metadata).map(([key, value]) => (
                              <span key={key} className="mr-4">
                                <span className="capitalize">{key}</span>: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Tests */}
          {provenance.qualityTests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <FlaskConical className="mr-2 h-6 w-6" />
                  Quality Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {provenance.qualityTests.map((test) => (
                    <div key={test._id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          Test conducted on {new Date(test.testDate).toLocaleDateString()}
                        </h4>
                        <Badge variant={test.status === 'pass' ? 'default' : 'destructive'}>
                          {test.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h5 className="font-medium text-primary mb-2">DNA Analysis Result</h5>
                        <p className="text-sm text-primary/80">{test.dnaResult}</p>
                      </div>

                      {test.certificateFile && (
                        <Button variant="outline" className="w-full">
                          View Quality Certificate
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Clock className="mr-2 h-6 w-6" />
                Product Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full mt-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.event}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleString()}
                      </p>
                      {Object.keys(event.details).length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {Object.entries(event.details).map(([key, value]) => (
                            <span key={key} className="mr-4">
                              <span className="capitalize">{key}</span>: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};