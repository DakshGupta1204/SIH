import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Leaf, 
  Award, 
  Users, 
  Truck, 
  FlaskConical,
  QrCode,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

import { ModeToggle } from '@/components/ModeToggle';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">AgriTrace</span>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Link to="/login">
              <Button variant="outline">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-foreground mb-6">
            Complete Agricultural 
            <br />
            <span className="text-primary">Traceability Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            From farm to fork, track every step of your agricultural products with blockchain-secured 
            transparency, AI-powered verification, and comprehensive quality assurance.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button size="lg" className="px-8 py-4 text-lg">
                Start Tracing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/consumer">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                <QrCode className="mr-2 h-5 w-5" />
                Scan Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card>
            <CardContent className="pt-8 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Blockchain Security</h3>
              <p className="text-muted-foreground">
                Immutable records secured by blockchain technology ensure data integrity and prevent tampering.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">AI Verification</h3>
              <p className="text-muted-foreground">
                Advanced AI models verify product authenticity and detect anomalies in the supply chain.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Quality Assurance</h3>
              <p className="text-muted-foreground">
                Comprehensive testing and certification ensure only the highest quality products reach consumers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Users */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-8">Built for Every Stakeholder</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Farmers */}
            <Card className="bg-card">
              <CardHeader className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">🌱 Farmers</CardTitle>
                <CardDescription>
                  Record harvests, verify crops, and build trust with consumers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">AI-powered crop verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">GPS-tracked harvest locations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Digital collection records</span>
                </div>
                <Link to="/register" className="block mt-4">
                  <Button className="w-full">
                    Join as Farmer
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Labs/Processors */}
            <Card className="bg-card">
              <CardHeader className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FlaskConical className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">🔬 Labs & Processors</CardTitle>
                <CardDescription>
                  Process batches, conduct quality tests, and ensure compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Processing step tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Quality test management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Certification workflows</span>
                </div>
                <Link to="/register" className="block mt-4">
                  <Button className="w-full">
                    Join as Lab
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Consumers */}
            <Card className="bg-card">
              <CardHeader className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">🛒 Consumers</CardTitle>
                <CardDescription>
                  Verify products, access full traceability, and make informed choices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">QR code verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Complete provenance data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Quality certifications</span>
                </div>
                <Link to="/consumer" className="block mt-4">
                  <Button className="w-full">
                    Start Scanning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Farm Collection</h3>
              <p className="text-muted-foreground">Farmers record harvest data with AI verification</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Processing</h3>
              <p className="text-muted-foreground">Labs track processing steps and conduct quality tests</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">QR Generation</h3>
              <p className="text-muted-foreground">Unique QR codes are generated for each product batch</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Consumer Access</h3>
              <p className="text-muted-foreground">Consumers scan QR codes to view complete traceability</p>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="text-center bg-card rounded-2xl p-12 border">
          <h2 className="text-3xl font-bold text-foreground mb-4">Try Our Demo</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Experience the full traceability journey with our sample product
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/verify/demo-batch-12345">
              <Button size="lg" variant="outline">
                <QrCode className="mr-2 h-5 w-5" />
                View Demo Product
              </Button>
            </Link>
            <Link to="/scan-stats/demo-batch-12345">
              <Button size="lg">
                View Analytics Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 AgriTrace. Building trust in agricultural supply chains.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
