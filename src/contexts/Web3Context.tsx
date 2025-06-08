
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { web3Service } from '../utils/web3';

interface Web3ContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  registerAgent: (name: string) => Promise<string>;
  postOrder: (restaurant: string, dish: string, quantity: number, pickup: string, drop: string, amount: string) => Promise<string | null>;
  confirmOrder: (orderId: string) => Promise<string>;
  payAgent: (orderId: string, amount: string) => Promise<string>;
  isLoading: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    try {
      const initialized = await web3Service.initialize();
      if (initialized) {
        const address = await web3Service.getWalletAddress();
        if (address) {
          setWalletAddress(address);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const setupEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setWalletAddress(null);
        } else {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      });
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const address = await web3Service.connectWallet();
      setWalletAddress(address || null);
      setIsConnected(!!address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerAgent = async (name: string) => {
    try {
      setIsLoading(true);
      return await web3Service.registerAgent(name);
    } finally {
      setIsLoading(false);
    }
  };

  const postOrder = async (restaurant: string, dish: string, quantity: number, pickup: string, drop: string, amount: string) => {
    try {
      setIsLoading(true);
      return await web3Service.postOrder(restaurant, dish, quantity, pickup, drop, amount);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      return await web3Service.confirmOrder(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  const payAgent = async (orderId: string, amount: string) => {
    try {
      setIsLoading(true);
      return await web3Service.payAgent(orderId, amount);
    } finally {
      setIsLoading(false);
    }
  };

  const value: Web3ContextType = {
    isConnected,
    walletAddress,
    connectWallet,
    registerAgent,
    postOrder,
    confirmOrder,
    payAgent,
    isLoading
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
