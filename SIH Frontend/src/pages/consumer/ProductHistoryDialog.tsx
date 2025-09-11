// filepath: /Users/dakshgupta/Desktop/SIH/SIH Frontend/src/pages/consumer/ProductHistoryDialog.tsx
import React from 'react';
import { ProductItem } from './CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface Props { product: ProductItem; onOpenChange: (open: boolean) => void; }

const ProductHistoryDialog: React.FC<Props> = ({ product, onOpenChange }) => {
  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{product.name} <Badge variant="secondary" className="flex gap-1 items-center"><ShieldCheck className="h-3 w-3 text-green-600" /> Blockchain Verified</Badge></DialogTitle>
          <DialogDescription>Complete provenance and processing lifecycle.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm">
            <p><span className="font-medium">Batch:</span> {product.batchId}</p>
            <p><span className="font-medium">Manufacturer:</span> {product.manufacturer}</p>
          </div>
          <ScrollArea className="h-72 pr-4 border rounded-md p-4">
            <ul className="space-y-4">
              {product.lifecycle.map((ev, idx) => (
                <li key={ev.hash} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                  {idx < product.lifecycle.length - 1 && <div className="absolute left-1.5 top-4 w-0.5 h-full bg-border" />}
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
  );
};

export default ProductHistoryDialog;