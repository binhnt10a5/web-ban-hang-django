import React, { createContext, useContext, useState, useEffect } from 'react';
import type { WalletTransaction } from '../types';
import { useAuth } from './AuthContext';

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  deposit: (amount: number) => Promise<{ success: boolean; message?: string }>;
  withdraw: (amount: number) => Promise<{ success: boolean; message?: string }>;
  pay: (amount: number, description: string) => Promise<{ success: boolean; message?: string }>;
  loadTransactions: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, updateUserWallet } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setBalance(user.walletBalance || 0);
      loadTransactions();
    } else {
      setBalance(0);
      setTransactions([]);
    }
  }, [isAuthenticated, user?.id]);

  const loadTransactions = () => {
    if (!user) return;
    
    const stored = localStorage.getItem(`wallet_transactions_${user.id}`);
    if (stored) {
      const txs = JSON.parse(stored) as WalletTransaction[];
      setTransactions(txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const saveTransaction = (tx: WalletTransaction) => {
    if (!user) return;
    
    const stored = localStorage.getItem(`wallet_transactions_${user.id}`);
    const existing = stored ? JSON.parse(stored) : [];
    const updated = [tx, ...existing];
    localStorage.setItem(`wallet_transactions_${user.id}`, JSON.stringify(updated));
    setTransactions(updated);
  };

  const deposit = async (amount: number): Promise<{ success: boolean; message?: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập' };
    }

    if (amount < 10000) {
      return { success: false, message: 'Số tiền nạp tối thiểu là 10.000đ' };
    }

    if (amount > 50000000) {
      return { success: false, message: 'Số tiền nạp tối đa là 50.000.000đ mỗi lần' };
    }

    const newBalance = balance + amount;
    
    const transaction: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      type: 'deposit',
      amount,
      balanceBefore: balance,
      balanceAfter: newBalance,
      description: `Nạp tiền vào ví`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    saveTransaction(transaction);
    setBalance(newBalance);
    updateUserWallet(newBalance);

    return { success: true, message: `Đã nạp ${amount.toLocaleString('vi-VN')}đ vào ví` };
  };

  const withdraw = async (amount: number): Promise<{ success: boolean; message?: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập' };
    }

    if (amount < 50000) {
      return { success: false, message: 'Số tiền rút tối thiểu là 50.000đ' };
    }

    if (amount > balance) {
      return { success: false, message: 'Số dư không đủ' };
    }

    const newBalance = balance - amount;
    
    const transaction: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      type: 'withdrawal',
      amount,
      balanceBefore: balance,
      balanceAfter: newBalance,
      description: `Rút tiền từ ví`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    saveTransaction(transaction);
    setBalance(newBalance);
    updateUserWallet(newBalance);

    return { success: true, message: `Đã rút ${amount.toLocaleString('vi-VN')}đ từ ví` };
  };

  const pay = async (amount: number, description: string): Promise<{ success: boolean; message?: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập' };
    }

    if (amount > balance) {
      return { success: false, message: 'Số dư không đủ để thanh toán' };
    }

    const newBalance = balance - amount;
    
    const transaction: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      type: 'payment',
      amount,
      balanceBefore: balance,
      balanceAfter: newBalance,
      description,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    saveTransaction(transaction);
    setBalance(newBalance);
    updateUserWallet(newBalance);

    return { success: true };
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, deposit, withdraw, pay, loadTransactions }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
