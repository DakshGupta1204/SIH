import React, { useMemo, useState } from 'react';
import { useCart, ProductItem, LifecycleEvent } from './CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, ShoppingCart, QrCode, Leaf, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ModeToggle } from '@/components/ModeToggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Generate mock lifecycle for each product
const mockLifecycle = (id: string): LifecycleEvent[] => {
  const stages = [
    { stage: 'Farmer', actor: 'GreenFields Cooperative', location: 'Kerala, IN', details: 'Organic cultivation of medicinal herbs.' },
    { stage: 'Lab', actor: 'Herbal Quality Labs', location: 'Bengaluru, IN', details: 'Purity & potency tests passed (ISO/IEC 17025).' },
    { stage: 'Processor', actor: 'AyurBlend Processors', location: 'Hyderabad, IN', details: 'Cold extraction & filtration, GMP compliant.' },
    { stage: 'Manufacturer', actor: 'VedaLife Naturals', location: 'Pune, IN', details: 'Formulation & encapsulation with batch QA.' },
    { stage: 'Store', actor: 'AgriTrace Marketplace', location: 'Online', details: 'Blockchain verified listing created.' }
  ];
  return stages.map((s, idx) => ({
    ...s,
    timestamp: new Date(Date.now() - (stages.length - idx) * 86400000).toISOString(),
    hash: '0x' + (id + idx).padEnd(16, '0')
  }));
};

const productData: ProductItem[] = Array.from({ length: 20 }).map((_, i) => {
  const baseNames = [
    'Ashwagandha Capsules','Turmeric Curcumin Extract','Triphala Digestive Tonic','Brahmi Brain Support','Neem Skin Cleanse','Tulsi Immunity Drops','Amla Vitamin C Tonic','Shatavari Women Support','Moringa Leaf Powder','Giloy Immunity Booster','Arjuna Cardio Care','Guggul Metabolic Balance','Licorice Soothe Syrup','Spirulina Super Greens','Herbal Sleep Support','Joint Flex Herbal Oil','Detox Liver Guard','Herbal Hair Revival Oil','Diabetic Care Mix','Respiratory Relief Kadha'
  ];
  const name = baseNames[i];
  return {
    id: 'P' + (i + 1),
    name,
    description: `${name} - premium standardized Ayurvedic formulation with full supply-chain transparency.`,
    image: `https://source.unsplash.com/seed/ayur${i}/400x300`,
    price: 199 + (i % 5) * 50,
    manufacturer: 'VedaLife Naturals',
    batchId: 'BATCH-' + (1000 + i),
    lifecycle: mockLifecycle('P' + (i + 1))
  };
});

const Ecommerce: React.FC = () => {
  const { addToCart, items } = useCart();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ProductItem | null>(null);

  const filtered = useMemo(() => productData.filter(p => p.name.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <Leaf className="text-primary" />
          <h1 className="text-xl font-bold">Consumer Marketplace</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-8 w-64" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <ModeToggle />
          <Button asChild variant="outline" className="relative">
            <Link to="/consumer/cart">
              <ShoppingCart className="h-4 w-4" />
              {items.length > 0 && <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">{items.length}</span>}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(product => (
          <Card key={product.id} className="flex flex-col">
            <div className="relative">
              <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-t-md" />
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge variant="secondary" className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-green-600" />Verified</Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setSelected(product)} className="bg-primary/80 hover:bg-primary text-primary-foreground rounded px-2 py-1 text-xs flex items-center gap-1">
                        <QrCode className="h-3 w-3" />QR
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>View blockchain traceability</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
              <CardDescription className="line-clamp-2">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">₹{product.price}</span>
                <span className="text-xs text-muted-foreground">Batch: {product.batchId}</span>
              </div>
              <Button onClick={() => addToCart(product)} className="w-full">Add to Cart</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selected.name}
                <Badge variant="secondary" className="flex gap-1 items-center"><ShieldCheck className="h-3 w-3 text-green-600" />Blockchain Verified</Badge>
              </DialogTitle>
              <DialogDescription>Complete provenance and processing lifecycle.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm">
                <p><span className="font-medium">Batch:</span> {selected.batchId}</p>
                <p><span className="font-medium">Manufacturer:</span> {selected.manufacturer}</p>
              </div>
              <ScrollArea className="h-72 pr-4 border rounded-md p-4">
                <ul className="space-y-4">
                  {selected.lifecycle.map((ev, idx) => (
                    <li key={ev.hash} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                      {idx < selected.lifecycle.length - 1 && <div className="absolute left-1.5 top-4 w-0.5 h-full bg-border" />}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{ev.stage}</Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{ev.actor}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(ev.timestamp).toLocaleString()} • {ev.location}</p>
                      <p className="text-xs mt-1">{ev.details}</p>
                      <p className="text-[10px] font-mono mt-1 text-muted-foreground">Hash: {ev.hash}</p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Ecommerce;