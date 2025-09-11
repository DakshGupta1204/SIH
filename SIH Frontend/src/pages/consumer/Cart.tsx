// filepath: /Users/dakshgupta/Desktop/SIH/SIH Frontend/src/pages/consumer/Cart.tsx
import React from 'react';
import { useCart } from './CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/ModeToggle';
import { Link } from 'react-router-dom';
import { Trash2, ArrowLeft } from 'lucide-react';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQty, total, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/consumer/ecommerce" className="flex gap-1 items-center"><ArrowLeft className="h-4 w-4" />Back</Link>
          </Button>
          <h1 className="text-xl font-bold">Your Cart</h1>
        </div>
        <div className="flex items-center gap-4">
            <ModeToggle />
        </div>
      </div>

      <div className="p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.length === 0 && <p className="text-sm text-muted-foreground">Your cart is empty.</p>}
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="flex gap-4 py-4">
                <img src={item.image} alt={item.name} className="h-24 w-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  <p className="text-sm mt-1 font-semibold">₹{item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input type="number" min={1} value={item.quantity} onChange={e => updateQty(item.id, Number(e.target.value))} className="w-20 h-8" />
                    <Button size="icon" variant="ghost" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Tax (5%)</span>
                <span>₹{(total * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total</span>
                <span>₹{(total * 1.05).toFixed(2)}</span>
              </div>
              <Button className="w-full" disabled={items.length === 0}>Checkout (Mock)</Button>
              {items.length > 0 && <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;