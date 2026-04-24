import React from 'react';
import { Outlet } from 'react-router';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';
import { WalletProvider } from '../contexts/WalletContext';

export function ProvidersWrapper() {
  return (
    <AuthProvider>
      <WalletProvider>
        <CartProvider>
          <WishlistProvider>
            <Outlet />
          </WishlistProvider>
        </CartProvider>
      </WalletProvider>
    </AuthProvider>
  );
}