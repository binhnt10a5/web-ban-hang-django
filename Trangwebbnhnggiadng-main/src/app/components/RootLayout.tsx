import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';
import { AdminChatbot } from './admin/AdminChatbot';
import { useAuth } from '../contexts/AuthContext';

export function RootLayout() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  
  // Check if current path is in admin area
  const isAdminPath = location.pathname.startsWith('/admin');
  
  // Ẩn chatbot khách hàng hoàn toàn khi đã đăng nhập admin
  // Chỉ hiển thị AdminChatbot cho admin users
  const showAdminChatbot = isAdmin && isAdminPath;
  const showCustomerChatbot = !isAdmin; // Chỉ hiện chatbot khách hàng khi KHÔNG phải admin

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Show appropriate chatbot based on user role and current path */}
      {showAdminChatbot ? (
        <AdminChatbot />
      ) : showCustomerChatbot ? (
        <Chatbot />
      ) : null}
    </div>
  );
}