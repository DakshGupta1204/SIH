import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCreateCollectionMutation, useVerifySpeciesMutation } from '@/store/slices/apiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Upload, Camera, MapPin, Calendar } from 'lucide-react';

export const NewCollection = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    species: '',
    latitude: '',
    longitude: '',
    harvestDate: '',
    quantity: '',
    imageFile: null as File | null,
  });
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [createCollection, { isLoading: isCreating }] = useCreateCollectionMutation();
  const [verifySpecies, { isLoading: isVerifying }] = useVerifySpeciesMutation();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, imageFile: file }));

    // Convert file to base64 for API
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      
      try {
        const result = await verifySpecies({ 
          image: base64, 
          species: formData.species || 'unknown' 
        }).unwrap();
        setVerificationResult(result);
        
        // Auto-fill species if confidence is high
        if (result.confidence > 0.8) {
          setFormData(prev => ({ ...prev, species: result.predicted_species }));
        }
        
        toast({
          title: 'Species verification complete',
          description: `Predicted: ${result.predicted_species} (${(result.confidence * 100).toFixed(1)}% confidence)`,
        });
      } catch (error) {
        toast({
          title: 'Species verification failed',
          description: 'Could not verify species from image',
          variant: 'destructive',
        });
      }
    };
    reader.readAsDataURL(file);
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
      const collectionData = {
        farmerId: user._id,
        species: formData.species,
        gpsCoordinates: {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude)
        },
        harvestDate: formData.harvestDate,
        quantity: parseFloat(formData.quantity),
        image: formData.imageFile ? URL.createObjectURL(formData.imageFile) : undefined,
      };

      const result = await createCollection(collectionData).unwrap();
      
      toast({
        title: 'Collection created successfully',
        description: `Your harvest has been recorded. QR Code: ${result.batch?.qrCode}`,
      });
      
      navigate('/farmer/collections');
    } catch (error: any) {
      toast({
        title: 'Failed to create collection',
        description: error.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="New Collection">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Record New Harvest</CardTitle>
            <CardDescription>
              Document your harvest collection with AI species verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center relative">
                  {formData.imageFile ? (
                    <div className="space-y-4">
                      <img 
                        src={URL.createObjectURL(formData.imageFile)} 
                        alt="Product"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      {verificationResult && (
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="font-medium text-primary">
                            AI Prediction: {verificationResult.predicted_species}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {(verificationResult.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-primary mx-auto" />
                      <div>
                        <p className="text-primary font-medium">Upload product image</p>
                        <p className="text-sm text-muted-foreground">
                          AI will verify the species automatically
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                {isVerifying && (
                  <p className="text-sm text-primary">Verifying species with AI...</p>
                )}
              </div>

              {/* Species */}
              <div className="space-y-2">
                <Label htmlFor="species">Species</Label>
                <Input
                  id="species"
                  value={formData.species}
                  onChange={(e) => handleInputChange('species', e.target.value)}
                  placeholder="e.g., Tomato, Wheat, Rice"
                  required
                />
              </div>

              {/* GPS Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary" />
                    <Input
                      id="latitude"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      placeholder="e.g., 28.6139"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    placeholder="e.g., 77.2090"
                    required
                  />
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString()
                      }));
                    });
                  }
                }}
              >
                Use Current Location
              </Button>

              {/* Harvest Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Harvest Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-primary" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="0.0"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Collection'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};