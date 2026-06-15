import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Agregar producto al carrito
  const addItem = useCallback((producto) => {
    setItems(prev => {
      const existing = prev.find(item => item.producto_id === producto.id);
      if (existing) {
        // No exceder stock
        if (existing.cantidad >= producto.stock) return prev;
        return prev.map(item =>
          item.producto_id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio),
        cantidad: 1,
        stock: producto.stock
      }];
    });
  }, []);

  // Quitar producto del carrito
  const removeItem = useCallback((producto_id) => {
    setItems(prev => prev.filter(item => item.producto_id !== producto_id));
  }, []);

  // Actualizar cantidad
  const updateQuantity = useCallback((producto_id, cantidad) => {
    if (cantidad <= 0) {
      setItems(prev => prev.filter(item => item.producto_id !== producto_id));
      return;
    }
    setItems(prev => prev.map(item =>
      item.producto_id === producto_id
        ? { ...item, cantidad: Math.min(cantidad, item.stock) }
        : item
    ));
  }, []);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calcular subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const subtotalFixed = parseFloat(subtotal.toFixed(2));

  // Calcular IGV 18%
  const igv = parseFloat((subtotalFixed * 0.18).toFixed(2));

  // Calcular total
  const total = parseFloat((subtotalFixed + igv).toFixed(2));

  // Contador total de items
  const count = items.reduce((sum, item) => sum + item.cantidad, 0);

  const value = {
    items,
    count,
    subtotal: subtotalFixed,
    igv,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}

export default CartContext;
