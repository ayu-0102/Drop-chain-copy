import { ethers } from 'ethers';

// Contract ABI - simplified for the main functions we need
export const DELIVERY_PLATFORM_ABI = [
  "function registerAgent(string memory _name) external",
  "function postOrder(string memory _restaurant, string memory _dish, uint256 _quantity, string memory _pickupLocation, string memory _dropLocation) external payable",
  "function confirmOrder(uint256 _orderId) external",
  "function completeDelivery(uint256 _orderId) external",
  "function payAgent(uint256 _orderId) external payable",
  "function payAgentWithToken(uint256 _orderId, uint256 _amount) external",
  "function getOrder(uint256 _orderId) external view returns (tuple(uint256 orderId, address customer, address agent, string restaurant, string dish, uint256 quantity, uint256 amount, string pickupLocation, string dropLocation, uint8 status, uint256 createdAt, uint256 confirmedAt, uint256 completedAt))",
  "function getAgent(address _agent) external view returns (tuple(address agentAddress, string name, uint256 rating, uint256 totalDeliveries, bool isActive))",
  "function nextOrderId() external view returns (uint256)",
  "event OrderPosted(uint256 indexed orderId, address indexed customer, uint256 amount)",
  "event OrderConfirmed(uint256 indexed orderId, address indexed agent)",
  "event PaymentMade(uint256 indexed orderId, address indexed customer, address indexed agent, uint256 amount, bool isETH)"
];

// Use a valid checksum address - this should be replaced with your deployed contract address
export const CONTRACT_ADDRESS = "0x742d35Cc6635C0532925a3b8D186000000000000";

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  async initialize() {
    console.log('Initializing Web3Service...');
    
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('MetaMask detected');
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        console.log('Provider created successfully');
        return true;
      } catch (error) {
        console.error('Error creating provider:', error);
        return false;
      }
    } else {
      console.log('MetaMask not detected');
      return false;
    }
  }

  async connectWallet() {
    console.log('Attempting to connect wallet...');
    
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      console.log('Requesting account access...');
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      console.log('Accounts received:', accounts);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask wallet.');
      }

      // Initialize provider and signer
      await this.initialize();
      
      if (!this.provider) {
        throw new Error('Failed to initialize provider');
      }

      this.signer = await this.provider.getSigner();
      console.log('Signer created successfully');
      
      // For demo purposes, we'll simulate a contract without actually deploying
      // In production, replace CONTRACT_ADDRESS with your deployed contract address
      try {
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, DELIVERY_PLATFORM_ABI, this.signer);
        console.log('Contract initialized successfully');
      } catch (contractError) {
        console.warn('Contract not deployed yet, using mock mode');
        // Continue without contract for demo
      }
      
      const address = await this.signer.getAddress();
      console.log('Wallet connected:', address);
      
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async registerAgent(name: string) {
    if (!this.signer) throw new Error('Wallet not connected');
    
    console.log('Registering agent:', name);
    
    // For demo purposes, simulate transaction
    const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66);
    console.log('Mock agent registration transaction:', mockTxHash);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return mockTxHash;
  }

  async postOrder(
    restaurant: string,
    dish: string,
    quantity: number,
    pickupLocation: string,
    dropLocation: string,
    amountInEth: string
  ) {
    if (!this.signer) throw new Error('Wallet not connected');
    
    console.log('Posting order:', { restaurant, dish, quantity, pickupLocation, dropLocation, amountInEth });
    
    try {
      // For demo purposes, simulate successful order posting
      const mockOrderId = Math.floor(Math.random() * 10000).toString();
      const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66);
      
      console.log('Mock order post transaction:', mockTxHash);
      console.log('Order posted with ID:', mockOrderId);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return mockOrderId;
    } catch (error) {
      console.error('Error posting order:', error);
      throw new Error('Failed to post order to blockchain');
    }
  }

  async confirmOrder(orderId: string) {
    if (!this.signer) throw new Error('Wallet not connected');
    
    console.log('Confirming order:', orderId);
    
    // For demo purposes, simulate transaction
    const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66);
    console.log('Mock order confirmation transaction:', mockTxHash);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return mockTxHash;
  }

  async payAgent(orderId: string, amountInEth: string) {
    if (!this.signer) throw new Error('Wallet not connected');
    
    console.log('Initiating payment to agent...', { orderId, amountInEth });
    
    try {
      // Convert ETH amount to Wei
      const amountInWei = ethers.parseEther(amountInEth);
      console.log('Amount in Wei:', amountInWei.toString());
      
      // Create a demo transaction to simulate payment
      const transaction = {
        to: CONTRACT_ADDRESS, // Demo recipient address
        value: amountInWei,
        gasLimit: 21000,
      };
      
      console.log('Sending transaction:', transaction);
      
      // Send the actual MetaMask transaction
      const tx = await this.signer.sendTransaction(transaction);
      console.log('Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      return tx.hash;
    } catch (error) {
      console.error('Payment transaction failed:', error);
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOrder(orderId: string) {
    console.log('Getting order:', orderId);
    // Mock implementation
    return null;
  }

  async getAgent(address: string) {
    console.log('Getting agent:', address);
    // Mock implementation
    return null;
  }

  async listenToPaymentEvents(callback: (event: any) => void) {
    console.log('Setting up payment event listener...');
    // Mock implementation for demo
  }

  async getWalletAddress() {
    if (!this.signer) {
      console.log('No signer available');
      return null;
    }
    try {
      const address = await this.signer.getAddress();
      console.log('Current wallet address:', address);
      return address;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }

  async checkConnection() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return accounts && accounts.length > 0;
      } catch (error) {
        console.error('Error checking connection:', error);
        return false;
      }
    }
    return false;
  }
}

export const web3Service = new Web3Service();
