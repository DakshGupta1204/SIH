import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCreateQualityTestMutation, usePredictQualityMLMutation } from '@/store/slices/apiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Upload, FlaskConical, FileText, Brain, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export const QualityTest = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    batchId: '',
    moisture: '',
    pesticideLevel: '',
    dnaResult: '',
    certificateFile: null as File | null,
  });
  const [createQualityTest, { isLoading: isCreating }] = useCreateQualityTestMutation();
  const [predictQualityML, { isLoading: isPredicting }] = usePredictQualityMLMutation();

  // Add ML prediction state
  const [mlPrediction, setMlPrediction] = useState<{
    quality_grade: string;
    confidence: number;
    expected_pass: boolean;
    factors: string[];
    recommendations: string;
  } | null>(null);

  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, certificateFile: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?._id) {
      toast({
        title: 'Authentication error',
        description: 'Please log in again',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const testData = {
        batchId: formData.batchId,
        labId: user._id,
        moisture: parseFloat(formData.moisture),
        pesticideLevel: parseFloat(formData.pesticideLevel),
        dnaResult: formData.dnaResult,
        certificateFile: formData.certificateFile ? URL.createObjectURL(formData.certificateFile) : undefined,
      };

      const result = await createQualityTest(testData).unwrap();
      
      toast({
        title: 'Quality test recorded successfully',
        description: `Test completed for batch ${formData.batchId}`,
      });
      
      navigate('/lab/dashboard');
    } catch (error: any) {
      toast({
        title: 'Failed to record quality test',
        description: error.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  // Auto-predict quality when key values change
  const handleQualityPredict = async () => {
    if (!formData.batchId || !formData.moisture || !formData.pesticideLevel) {
      return;
    }

    try {
      const result = await predictQualityML({
        batch_id: formData.batchId,
        moisture: parseFloat(formData.moisture),
        pesticide_level: parseFloat(formData.pesticideLevel),
        // Optional environmental data - using defaults if not available
        temperature: 25, // Default temperature
        humidity: 60, // Default humidity
      }).unwrap();

      setMlPrediction({
        quality_grade: result.quality_grade,
        confidence: result.confidence,
        expected_pass: result.expected_pass,
        factors: result.factors,
        recommendations: result.recommendations
      });

      toast({
        title: 'Quality predicted',
        description: `${result.quality_grade} (${Math.round(result.confidence * 100)}% confidence)`,
      });
    } catch (error) {
      console.error('ML prediction failed:', error);
      toast({
        title: 'Quality prediction failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user?.role === 'processor') {
      toast({
        title: 'Access Restricted',
        description: 'Processors cannot create lab reports. Only lab personnel are authorized.',
        variant: 'destructive'
      });
    }
  }, [user]);

  if (user?.role === 'processor') return null; // hide form for processors

  return (
    <DashboardLayout title="Quality Test">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <FlaskConical className="mr-2 h-6 w-6" />
              New Quality Test
            </CardTitle>
            <CardDescription>
              Record quality testing results and upload certification documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Batch ID */}
              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID</Label>
                <Input
                  id="batchId"
                  value={formData.batchId}
                  onChange={(e) => handleInputChange('batchId', e.target.value)}
                  placeholder="Enter batch identifier"
                  required
                />
              </div>

              {/* Test Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Moisture Content */}
                <div className="space-y-2">
                  <Label htmlFor="moisture">Moisture Content (%)</Label>
                  <Input
                    id="moisture"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.moisture}
                    onChange={(e) => handleInputChange('moisture', e.target.value)}
                    onBlur={handleQualityPredict}
                    placeholder="0.0"
                    required
                  />
                </div>

                {/* Pesticide Level */}
                <div className="space-y-2">
                  <Label htmlFor="pesticide">Pesticide Level (ppm)</Label>
                  <Input
                    id="pesticide"
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.pesticideLevel}
                    onChange={(e) => handleInputChange('pesticideLevel', e.target.value)}
                    onBlur={handleQualityPredict}
                    placeholder="0.000"
                    required
                  />
                </div>
              </div>

              {/* DNA Analysis Result */}
              <div className="space-y-2">
                <Label htmlFor="dna">DNA Analysis Result</Label>
                <Textarea
                  id="dna"
                  value={formData.dnaResult}
                  onChange={(e) => handleInputChange('dnaResult', e.target.value)}
                  placeholder="Enter detailed DNA analysis findings..."
                  rows={4}
                  required
                />
              </div>

              {/* Certificate Upload */}
              <div className="space-y-2 relative">
                <Label>Quality Certificate</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {formData.certificateFile ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 text-primary mx-auto" />
                      <p className="font-medium text-primary">
                        {formData.certificateFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Certificate uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-foreground font-medium">Upload certificate file</p>
                        <p className="text-sm text-muted-foreground">
                          PDF, DOC, or image files accepted
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* ML Quality Prediction Display */}
              {mlPrediction && (
                <Alert className={`${mlPrediction.expected_pass ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <Brain className={`h-4 w-4 ${mlPrediction.expected_pass ? 'text-green-600' : 'text-red-600'}`} />
                  <AlertDescription>
                    <div>
                      <strong>AI Quality Prediction:</strong> {mlPrediction.quality_grade}
                      <br />
                      <span className="text-sm">
                        Confidence: {Math.round(mlPrediction.confidence * 100)}% | 
                        Expected: {mlPrediction.expected_pass ? 'PASS' : 'FAIL'}
                      </span>
                      <br />
                      <span className="text-sm italic">{mlPrediction.recommendations}</span>
                      {mlPrediction.factors.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs">Factors: </span>
                          {mlPrediction.factors.map((factor, index) => (
                            <Badge key={index} className="mr-1 text-xs border border-input">
                              {factor.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* AI Quality Prediction Button */}
              <Button
                type="button"
                onClick={handleQualityPredict}
                disabled={isPredicting || !formData.moisture || !formData.pesticideLevel || !formData.batchId}
                className="w-full mb-4 border border-input hover:bg-accent hover:text-accent-foreground"
              >
                {isPredicting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Predicting Quality...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Predict Quality with AI
                  </>
                )}
              </Button>

              {isPredicting && (
                <div className="text-center mb-4">
                  <p className="text-sm text-primary">
                    AI is analyzing quality parameters...
                  </p>
                </div>
              )}

              {/* Test Summary */}
              <Card className="bg-muted/50 border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-primary">Test Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Batch ID:</span>
                    <span className="font-medium">{formData.batchId || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Moisture:</span>
                    <span className="font-medium">{formData.moisture ? `${formData.moisture}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pesticide Level:</span>
                    <span className="font-medium">{formData.pesticideLevel ? `${formData.pesticideLevel} ppm` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium">
                      {formData.certificateFile ? 'Uploaded' : 'Required'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Results...
                  </>
                ) : (
                  'Submit Quality Test'
                )}
              </Button>

              {mlPrediction && !mlPrediction.expected_pass && (
                <div className="text-center">
                  <p className="text-sm text-red-600">
                    ⚠ AI predicts this batch may fail quality standards
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Consider reviewing test results before submission
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};