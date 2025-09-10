import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QrCode, Search, Shield, Leaf, Award } from 'lucide-react';

import { ModeToggle } from '@/components/ModeToggle';

export const ConsumerHome = () => {
  const [qrCode, setQrCode] = useState('');
  const navigate = useNavigate();

  const handleScan = () => {
    if (qrCode.trim()) {
      navigate(`/verify/${qrCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            AgriTrace Consumer Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verify the origin and quality of your agricultural products with complete transparency
          </p>
        </div>

        {/* QR Scanner Section */}
        <Card className="max-w-md mx-auto mb-16">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-primary">
              <QrCode className="mr-2 h-6 w-6" />
              Verify Product
            </CardTitle>
            <CardDescription>
              Scan or enter a QR code to view product provenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter QR code or product ID..."
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              />
              <Button onClick={handleScan}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // In a real app, this would open camera for QR scanning
                setQrCode('demo-batch-12345');
              }}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Use Camera to Scan
            </Button>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Full Traceability</h3>
              <p className="text-muted-foreground">
                Track your food from farm to table with complete transparency
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Quality Assurance</h3>
              <p className="text-muted-foreground">
                Verified quality tests and certifications for every product
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Blockchain Verified</h3>
              <p className="text-muted-foreground">
                Immutable records secured by blockchain technology
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-4">Try Our Demo</h2>
          <p className="text-muted-foreground mb-6">
            Experience the full traceability journey with our sample product
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => navigate('/verify/demo-batch-12345')}
              variant="outline" 
            >
              View Demo Product
            </Button>
            <Button 
              onClick={() => navigate('/scan-stats/demo-batch-12345')}
            >
              View Analytics Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};