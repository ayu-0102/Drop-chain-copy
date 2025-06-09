import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { icpWeb3Service } from '../utils/icpWeb3';

interface ICPWeb3ContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  registerAgent: (name: string) => Promise<string>;
  postOrder: (restaurant: string, dish: string, quantity: number, pickup: string, drop: string, amount: string) => Promise<string | null>;
  confirmOrder: (orderId: string) => Promise<string>;
  payAgent: (orderId: string, amount: string, agentWalletAddress: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

const ICPWeb3Context = createContext<ICPWeb3ContextType | undefined>(undefined);

export const useICPWeb3 = () => {
  const context = useContext(ICPWeb3Context);
  if (!context) {
    throw new Error('useICPWeb3 must be used within an ICPWeb3Provider');
  }
  return context;
};

interface ICPWeb3ProviderProps {
  children: ReactNode;
}

export const ICPWeb3Provider: React.FC<ICPWeb3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    try {
      console.log('Initializing ICP Web3 service...');
      const initialized = await icpWeb3Service.initialize();
      if (initialized) {
        const connected = await icpWeb3Service.checkConnection();
        if (connected) {
          const address = await icpWeb3Service.getWalletAddress();
          if (address) {
            setWalletAddress(address);
            setIsConnected(true);
            console.log('Existing ICP connection found:', address);
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize ICP service:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting ICP wallet connection process...');
      
      const address = await icpWeb3Service.connectWallet();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
        console.log('ICP wallet connected successfully:', address);
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error: any) {
      console.error('Failed to connect ICP wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      setIsConnected(false);
      setWalletAddress(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerAgent = async (name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      return await icpWeb3Service.registerAgent(name);
    } catch (error: any) {
      setError(error.message || 'Failed to register agent');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const postOrder = async (restaurant: string, dish: string, quantity: number, pickup: string, drop: string, amount: string) => {
    try {
      setIsLoading(true);
      setError(null);
      return await icpWeb3Service.postOrder(restaurant, dish, quantity, pickup, drop, amount);
    } catch (error: any) {
      setError(error.message || 'Failed to post order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      return await icpWeb3Service.confirmOrder(orderId);
    } catch (error: any) {
      setError(error.message || 'Failed to confirm order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const payAgent = async (orderId: string, amount: string, agentWalletAddress: string) => {
    try {
      setIsLoading(true);
      setError(null);
      return await icpWeb3Service.payAgent(orderId, amount, agentWalletAddress);
    } catch (error: any) {
      setError(error.message || 'Failed to pay agent');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ICPWeb3ContextType = {
    isConnected,
    walletAddress,
    connectWallet,
    registerAgent,
    postOrder,
    confirmOrder,
    payAgent,
    isLoading,
    error
  };

  return (
    <ICPWeb3Context.Provider value={value}>
      {children}
    </ICPWeb3Context.Provider>
  );
};