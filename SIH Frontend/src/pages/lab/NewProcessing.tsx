import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';
import { RootState } from '@/store';
import { useCreateProcessingStepMutation } from '@/store/slices/apiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Factory, Calendar, Settings } from 'lucide-react';

const NewProcessing = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    batchId: '',
    stepType: 'drying' as 'drying' | 'grinding' | 'packaging' | 'sorting' | 'cleaning' | 'washing' | 'fermentation' | 'storage',
    date: new Date().toISOString().split('T')[0],
    temperature: '',
    duration: '',
    humidity: '',
    notes: '',
  });
  const [createProcessingStep, { isLoading }] = useCreateProcessingStepMutation();
  const navigate = useNavigate();

  const processingSteps = [
    { value: 'drying', label: 'Drying' },
    { value: 'grinding', label: 'Grinding' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'sorting', label: 'Sorting' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'washing', label: 'Washing' },
    { value: 'fermentation', label: 'Fermentation' },
    { value: 'storage', label: 'Storage' },
  ];

  useEffect(() => {
    if (user?.role === 'lab') {
      sonnerToast.error('Labs are not permitted to start new processing batches. Only processors can.');
      navigate('/lab/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const metadata: Record<string, any> = {};
      
      if (formData.temperature) metadata.temperature = parseFloat(formData.temperature);
      if (formData.duration) metadata.duration = parseFloat(formData.duration);
      if (formData.humidity) metadata.humidity = parseFloat(formData.humidity);
      if (formData.notes) metadata.notes = formData.notes;

      const processingData = {
        batchId: formData.batchId,
        processorId: user._id,
        stepType: formData.stepType,
        date: formData.date || new Date().toISOString().split('T')[0],
        metadata,
      };

      const result = await createProcessingStep(processingData).unwrap();
      
      toast({
        title: 'Processing step added successfully',
        description: `${formData.stepType} step recorded for batch ${formData.batchId}`,
      });
      
      navigate('/lab/dashboard');
    } catch (error: any) {
      toast({
        title: 'Failed to add processing step',
        description: error.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  if (user?.role === 'lab') return null;

  return (
    <DashboardLayout title="New Processing Step">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <Factory className="mr-2 h-6 w-6" />
              Add Processing Step
            </CardTitle>
            <CardDescription>
              Record a new processing step for a batch
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

              {/* Step Type */}
              <div className="space-y-2">
                <Label>Processing Step Type</Label>
                <Select value={formData.stepType} onValueChange={(value: 'drying' | 'grinding' | 'packaging' | 'sorting' | 'cleaning' | 'washing' | 'fermentation' | 'storage') => handleInputChange('stepType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select processing step" />
                  </SelectTrigger>
                  <SelectContent>
                    {processingSteps.map((step) => (
                      <SelectItem key={step.value} value={step.value}>
                        {step.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Processing Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-primary" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Processing Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                    placeholder="25.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="2.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.humidity}
                    onChange={(e) => handleInputChange('humidity', e.target.value)}
                    placeholder="60"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Processing Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about the processing step..."
                  rows={3}
                />
              </div>

              {/* Step Summary */}
              {formData.stepType && (
                <Card className="bg-muted/50 border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-primary flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Processing Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Batch ID:</span>
                      <span className="font-medium">{formData.batchId || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Step Type:</span>
                      <span className="font-medium capitalize">{formData.stepType}</span>
                    </div>
                    {formData.temperature && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span className="font-medium">{formData.temperature}°C</span>
                      </div>
                    )}
                    {formData.duration && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{formData.duration} hours</span>
                      </div>
                    )}
                    {formData.humidity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Humidity:</span>
                        <span className="font-medium">{formData.humidity}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Adding Processing Step...' : 'Add Processing Step'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export { NewProcessing };
