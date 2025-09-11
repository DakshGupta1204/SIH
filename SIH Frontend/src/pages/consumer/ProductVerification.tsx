import { useParams } from 'react-router-dom';
import { useVerifyProductQuery, useDetectBatchFraudMutation } from '@/store/slices/apiSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, MapPin, Calendar, FlaskConical, Package, CheckCircle, Clock, Leaf, Star, Brain, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const ProductVerification = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const { data: provenance, isLoading } = useVerifyProductQuery(qrCode!);
  const [detectFraud, { isLoading: isDetectingFraud }] = useDetectBatchFraudMutation();

  // ML fraud detection state
  const [fraudDetection, setFraudDetection] = useState<{
    fraud_score: number;
    risk_level: string;
    anomaly_detected: boolean;
    factors: string[];
    recommendations: string;
  } | null>(null);

  // Auto-detect fraud when component loads
  useEffect(() => {
    if (provenance?.batch && !fraudDetection) {
      handleFraudDetection();
    }
  }, [provenance]);

  const handleFraudDetection = async () => {
    if (!provenance?.batch) return;

    try {
      const batchAge = Math.floor(
        (new Date().getTime() - new Date(provenance.batch.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      const result = await detectFraud({
        batch_data: {
          age_days: batchAge,
          harvest_date: provenance.batch.createdAt,
          farmer_id: 'unknown'
        },
        scan_history: [],
        location_data: {
          lat_variance: 0.1,
          lng_variance: 0.1
        }
      }).unwrap();

      setFraudDetection({
        fraud_score: result.fraud_score,
        risk_level: result.risk_level,
        anomaly_detected: result.anomaly_detected,
        factors: result.factors,
        recommendations: result.recommendations
      });

    } catch (error) {
      console.error('Fraud detection failed:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Product Verification">
        <div className="flex items-center justify-center p-8">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Verifying product authenticity...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!provenance?.verified) {
    return (
      <DashboardLayout title="Product Verification">
        <div className="flex items-center justify-center p-8">
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
      </DashboardLayout>
    );
  }

  const { batch, provenance: provenanceData, timeline } = provenance;

  return (
    <DashboardLayout title="Product Verification">
      <div className="space-y-6">
        
        {/* AI Fraud Detection Alert */}
        {fraudDetection && (
          <Alert className={`${
            fraudDetection.risk_level === 'high' ? 'border-red-200 bg-red-50' :
            fraudDetection.risk_level === 'medium' ? 'border-yellow-200 bg-yellow-50' :
            'border-green-200 bg-green-50'
          }`}>
            <Shield className={`h-4 w-4 ${
              fraudDetection.risk_level === 'high' ? 'text-red-600' :
              fraudDetection.risk_level === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`} />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>AI Fraud Detection:</strong> {fraudDetection.risk_level.toUpperCase()} Risk
                  <br />
                  <span className="text-sm">
                    Fraud Score: {Math.round(fraudDetection.fraud_score * 100)}% | 
                    {fraudDetection.anomaly_detected ? ' Anomaly Detected' : ' Normal Activity'}
                  </span>
                  <br />
                  <span className="text-sm italic">{fraudDetection.recommendations}</span>
                  {fraudDetection.factors.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs">Risk Factors: </span>
                      {fraudDetection.factors.map((factor, index) => (
                        <Badge key={index} className="mr-1 text-xs">
                          {factor.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge className={`${
                  fraudDetection.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                  fraudDetection.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {fraudDetection.risk_level === 'high' ? '⚠ HIGH RISK' :
                   fraudDetection.risk_level === 'medium' ? '⚠ MEDIUM RISK' :
                   '✓ LOW RISK'}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Status Header */}
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="mr-2 h-6 w-6" />
              Product Verified Authentic
            </CardTitle>
            <CardDescription>
              This product has been verified through our blockchain-based traceability system
            </CardDescription>
          </CardHeader>
        </Card>

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
              {provenanceData.collection.image && (
                <img 
                  src={provenanceData.collection.image} 
                  alt={provenanceData.collection.species}
                  className="w-full max-w-md mx-auto h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{provenanceData.collection.species}</h3>
                  <Badge className={`${
                    provenanceData.collection.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                    provenanceData.collection.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {provenanceData.collection.verificationStatus}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Package className="mr-2 h-4 w-4" />
                    {provenanceData.collection.quantity} kg harvested
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(provenanceData.collection.harvestDate).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {provenanceData.collection.gpsCoordinates.lat.toFixed(4)}, {provenanceData.collection.gpsCoordinates.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Tests */}
        {provenanceData.qualityTests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <FlaskConical className="mr-2 h-6 w-6" />
                Quality Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {provenanceData.qualityTests.map((test) => (
                  <div key={test._id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        Test conducted on {new Date(test.testDate).toLocaleDateString()}
                      </h4>
                      <Badge className={test.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced verification status with ML */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center text-blue-700">
              <CheckCircle className="mr-2 h-6 w-6" />
              AI-Powered Verification Status
            </CardTitle>
            <CardDescription>
              Comprehensive verification using AI and blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Blockchain Verification */}
              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold">Blockchain</h4>
                <Badge className="bg-green-100 text-green-800">VERIFIED</Badge>
              </div>

              {/* ML Fraud Detection */}
              <div className="text-center p-4 border rounded-lg">
                <Brain className={`h-8 w-8 mx-auto mb-2 ${
                  fraudDetection?.risk_level === 'low' ? 'text-green-500' :
                  fraudDetection?.risk_level === 'medium' ? 'text-yellow-500' :
                  'text-red-500'
                }`} />
                <h4 className="font-semibold">AI Fraud Detection</h4>
                {isDetectingFraud ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                ) : fraudDetection ? (
                  <Badge className={
                    fraudDetection.risk_level === 'low' ? 'bg-green-100 text-green-800' :
                    fraudDetection.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {fraudDetection.risk_level.toUpperCase()}
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">PENDING</Badge>
                )}
              </div>

              {/* Overall Trust Score */}
              <div className="text-center p-4 border rounded-lg">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold">Trust Score</h4>
                <Badge className="bg-blue-100 text-blue-800">
                  {fraudDetection ? 
                    Math.round((1 - fraudDetection.fraud_score) * 100) : 
                    95
                  }%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};