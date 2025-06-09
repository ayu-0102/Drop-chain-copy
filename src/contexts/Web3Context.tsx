import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { web3Service } from '../utils/web3';

interface Web3ContextType {
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    try {
      console.log('Checking existing wallet connection...');
      const connected = await web3Service.checkConnection();
      if (connected) {
        const initialized = await web3Service.initialize();
        if (initialized) {
          const address = await web3Service.getWalletAddress();
          if (address) {
            setWalletAddress(address);
            setIsConnected(true);
            console.log('Existing connection found:', address);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const setupEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          setIsConnected(false);
          setWalletAddress(null);
          setError('Wallet disconnected');
        } else {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          setError(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        console.log('Chain changed, reloading...');
        window.location.reload();
      });
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting wallet connection process...');
      
      const address = await web3Service.connectWallet();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
        console.log('Wallet connected successfully:', address);
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
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
      return await web3Service.registerAgent(name);
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
      return await web3Service.postOrder(restaurant, dish, quantity, pickup, drop, amount);
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
      return await web3Service.confirmOrder(orderId);
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
      return await web3Service.payAgent(orderId, amount, agentWalletAddress);
    } catch (error: any) {
      setError(error.message || 'Failed to pay agent');
      throw error;
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
    isLoading,
    error
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
