import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCreateCollectionMutation, useVerifySpeciesMLMutation } from '@/store/slices/apiSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Upload, Camera, MapPin, Calendar, CheckCircle, AlertCircle, Brain, Loader2 } from 'lucide-react';

export const NewCollection = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createCollection, { isLoading: isCreating }] = useCreateCollectionMutation();
  const [verifySpeciesML, { isLoading: isVerifyingML }] = useVerifySpeciesMLMutation();

  const [formData, setFormData] = useState({
    species: '',
    quantity: '',
    harvestDate: '',
    image: '',
    gpsCoordinates: {
      lat: '',
      lng: ''
    },
    notes: ''
  });

  // Add ML verification state
  const [mlVerification, setMlVerification] = useState<{
    verified: boolean;
    confidence: number;
    predicted_species: string;
    is_match: boolean;
  } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({ 
        ...prev, 
        [parent]: { 
          ...(prev[parent as keyof typeof prev] as any), 
          [child]: value 
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setFormData(prev => ({ ...prev, image: base64 }));
        
        // Auto-verify species if species is already selected
        if (formData.species && base64) {
          try {
            const result = await verifySpeciesML({
              image: base64,
              species: formData.species
            }).unwrap();
            
            setMlVerification({
              verified: result.is_match,
              confidence: result.confidence,
              predicted_species: result.predicted_species,
              is_match: result.is_match
            });

            if (result.is_match) {
              toast({
                title: 'Species verified',
                description: `${result.predicted_species} (${Math.round(result.confidence * 100)}% confidence)`,
              });
            } else {
              toast({
                title: 'Species mismatch detected',
                description: `Expected: ${formData.species}, Predicted: ${result.predicted_species}`,
                variant: 'destructive',
              });
            }
          } catch (error) {
            console.error('ML verification failed:', error);
            toast({
              title: 'Species verification failed',
              description: 'Please try again',
              variant: 'destructive',
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeciesChange = async (species: string) => {
    setFormData(prev => ({ ...prev, species }));
    
    // Auto-verify if image is already uploaded
    if (formData.image && species) {
      try {
        const result = await verifySpeciesML({
          image: formData.image,
          species
        }).unwrap();
        
        setMlVerification({
          verified: result.is_match,
          confidence: result.confidence,
          predicted_species: result.predicted_species,
          is_match: result.is_match
        });

        if (result.is_match) {
          toast({
            title: 'Species verified',
            description: `${result.predicted_species} (${Math.round(result.confidence * 100)}% confidence)`,
          });
        } else {
          toast({
            title: 'Species mismatch detected',
            description: `Expected: ${species}, Predicted: ${result.predicted_species}`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('ML verification failed:', error);
        toast({
          title: 'Species verification failed',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check ML verification
    if (!mlVerification?.verified) {
      toast({
        title: 'Species verification required',
        description: 'Please verify species with ML before submitting',
        variant: 'destructive',
      });
      return;
    }

    try {
      const collectionData = {
        farmerId: user?._id || '', // Add required farmerId
        species: formData.species,
        quantity: parseFloat(formData.quantity),
        gpsCoordinates: {
          lat: parseFloat(formData.gpsCoordinates.lat),
          lng: parseFloat(formData.gpsCoordinates.lng)
        },
        harvestDate: formData.harvestDate,
        image: formData.image,
        // mlVerification data will be handled by backend
      };

      await createCollection(collectionData).unwrap();
      toast({
        title: 'Collection created successfully',
        description: 'Your harvest has been recorded',
      });
      navigate('/farmer/collections');
    } catch (error) {
      toast({
        title: 'Failed to create collection',
        description: 'An error occurred',
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
                  {formData.image ? (
                    <div className="space-y-4">
                      <img 
                        src={formData.image} 
                        alt="Product"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      {mlVerification && (
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="font-medium text-primary">
                            AI Prediction: {mlVerification.predicted_species}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {(mlVerification.confidence * 100).toFixed(1)}%
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
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                {isVerifyingML && (
                  <p className="text-sm text-primary">Verifying species with AI...</p>
                )}
              </div>

              {/* Species */}
              <div className="space-y-2">
                <Label htmlFor="species">Species</Label>
                <Input
                  id="species"
                  value={formData.species}
                  onChange={(e) => handleSpeciesChange(e.target.value)}
                  placeholder="e.g., Turmeric, Ginger, Neem, Tulsi"
                  required
                />
                {/* ML Verification Status */}
                {formData.species && formData.image && (
                  <div className={`p-3 rounded-lg border ${
                    mlVerification?.verified 
                      ? 'bg-green-50 border-green-200' 
                      : mlVerification 
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {isVerifyingML ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                          <span className="text-sm text-yellow-700">AI is verifying species...</span>
                        </>
                      ) : mlVerification ? (
                        mlVerification.verified ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">
                              ✓ Species verified: {mlVerification.predicted_species} 
                              ({Math.round(mlVerification.confidence * 100)}% confidence)
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-700">
                              ⚠ Species mismatch: Expected {formData.species}, predicted {mlVerification.predicted_species}
                            </span>
                          </>
                        )
                      ) : (
                        <>
                          <Brain className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700">Ready for AI verification</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* GPS Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary" />
                    <Input
                      id="latitude"
                      value={formData.gpsCoordinates.lat}
                      onChange={(e) => handleInputChange('gpsCoordinates.lat', e.target.value)}
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
                    value={formData.gpsCoordinates.lng}
                    onChange={(e) => handleInputChange('gpsCoordinates.lng', e.target.value)}
                    placeholder="e.g., 77.2090"
                    required
                  />
                </div>
              </div>
                            <Button 
                type="button" 
                className="border border-input hover:bg-accent hover:text-accent-foreground text-sm h-9 px-3"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      setFormData(prev => ({
                        ...prev,
                        gpsCoordinates: {
                          lat: position.coords.latitude.toString(),
                          lng: position.coords.longitude.toString()
                        }
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
                disabled={isCreating || !mlVerification?.verified}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Collection...
                  </>
                ) : (
                  'Create Collection'
                )}
              </Button>

              {!mlVerification?.verified && formData.image && formData.species && (
                <p className="text-sm text-amber-600 text-center">
                  AI species verification required before submitting
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};