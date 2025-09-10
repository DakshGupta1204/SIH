import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCreateProcessingStepMutation, useGetAvailableBatchesQuery } from '@/store/slices/apiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Clock, Settings, Thermometer } from 'lucide-react';

export const ProcessingStep = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: batches = [], isLoading: batchesLoading } = useGetAvailableBatchesQuery();
  const [formData, setFormData] = useState({
    batchId: '',
    stepType: 'drying' as 'drying' | 'grinding' | 'packaging' | 'sorting' | 'cleaning' | 'washing' | 'fermentation' | 'storage',
    date: new Date().toISOString().split('T')[0],
    metadata: {} as Record<string, any>,
  });
  const [metadataFields, setMetadataFields] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' }
  ]);
  const [createProcessingStep, { isLoading }] = useCreateProcessingStepMutation();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMetadataChange = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...metadataFields];
    newFields[index][field] = value;
    setMetadataFields(newFields);
    
    // Update metadata object
    const metadata: Record<string, any> = {};
    newFields.forEach(({ key, value }) => {
      if (key && value) {
        metadata[key] = value;
      }
    });
    setFormData(prev => ({ ...prev, metadata }));
  };

  const addMetadataField = () => {
    setMetadataFields(prev => [...prev, { key: '', value: '' }]);
  };

  const removeMetadataField = (index: number) => {
    if (metadataFields.length > 1) {
      const newFields = metadataFields.filter((_, i) => i !== index);
      setMetadataFields(newFields);
      
      // Update metadata object
      const metadata: Record<string, any> = {};
      newFields.forEach(({ key, value }) => {
        if (key && value) {
          metadata[key] = value;
        }
      });
      setFormData(prev => ({ ...prev, metadata }));
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

    if (!formData.batchId) {
      toast({
        title: 'Validation error',
        description: 'Please select a batch',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const stepData = {
        batchId: formData.batchId,
        processorId: user._id,
        stepType: formData.stepType,
        date: formData.date,
        metadata: formData.metadata,
      };

      const result = await createProcessingStep(stepData).unwrap();
      
      toast({
        title: 'Processing step added successfully',
        description: `Step "${formData.stepType}" recorded for batch ${formData.batchId}`,
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

  return (
    <DashboardLayout title="New Processing Step">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <Settings className="mr-2 h-6 w-6" />
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
                <Label htmlFor="batchId">Select Batch</Label>
                <Select 
                  value={formData.batchId} 
                  onValueChange={(value) => handleInputChange('batchId', value)}
                  disabled={batchesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={batchesLoading ? "Loading batches..." : "Select a batch"} />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch._id} value={batch._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{batch.qrCode}</span>
                          <span className="text-sm text-muted-foreground">
                            {typeof batch.collectionId === 'object' && batch.collectionId?.species 
                              ? `${batch.collectionId.species} - ${batch.status}`
                              : batch.status
                            }
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.batchId && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {batches.find(b => b._id === formData.batchId)?.qrCode}
                  </div>
                )}
              </div>

              {/* Step Type */}
              <div className="space-y-2">
                <Label htmlFor="stepType">Processing Step Type</Label>
                <Select value={formData.stepType} onValueChange={(value) => handleInputChange('stepType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drying">🌤️ Drying</SelectItem>
                    <SelectItem value="grinding">⚙️ Grinding</SelectItem>
                    <SelectItem value="packaging">📦 Packaging</SelectItem>
                    <SelectItem value="sorting">🔍 Sorting</SelectItem>
                    <SelectItem value="cleaning">🧹 Cleaning</SelectItem>
                    <SelectItem value="washing">💧 Washing</SelectItem>
                    <SelectItem value="fermentation">🧪 Fermentation</SelectItem>
                    <SelectItem value="storage">🏪 Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Processing Date</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-primary" />
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

              {/* Metadata Fields */}
              <div className="space-y-4">
                <Label>Processing Parameters</Label>
                {metadataFields.map((field, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Parameter name (e.g., temperature)"
                      value={field.key}
                      onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                    />
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Value (e.g., 60°C)"
                        value={field.value}
                        onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                      />
                      {metadataFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMetadataField(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMetadataField}
                >
                  Add Parameter
                </Button>
              </div>

              {/* Processing Summary */}
              <Card className="bg-muted/50 border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-primary">Processing Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Batch:</span>
                    <span className="font-medium">
                      {formData.batchId 
                        ? batches.find(b => b._id === formData.batchId)?.qrCode || 'Unknown'
                        : 'Not selected'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Step Type:</span>
                    <span className="font-medium capitalize">{formData.stepType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{formData.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Parameters:</span>
                    <span className="font-medium">
                      {Object.keys(formData.metadata).length} added
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Adding Step...' : 'Add Processing Step'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
