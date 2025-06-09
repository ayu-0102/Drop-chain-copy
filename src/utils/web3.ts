
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

// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0x742d35Cc6635C0532925a3b8D186000000000000"; // Update this after deployment

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
      
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, DELIVERY_PLATFORM_ABI, this.signer);
      console.log('Contract initialized successfully');
      
      const address = await this.signer.getAddress();
      console.log('Wallet connected:', address);
      
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async registerAgent(name: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    console.log('Registering agent:', name);
    const tx = await this.contract.registerAgent(name);
    console.log('Agent registration transaction:', tx.hash);
    await tx.wait();
    return tx.hash;
  }

  async postOrder(
    restaurant: string,
    dish: string,
    quantity: number,
    pickupLocation: string,
    dropLocation: string,
    amountInEth: string
  ) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    console.log('Posting order:', { restaurant, dish, quantity, pickupLocation, dropLocation, amountInEth });
    
    const tx = await this.contract.postOrder(
      restaurant,
      dish,
      quantity,
      pickupLocation,
      dropLocation,
      { value: ethers.parseEther(amountInEth) }
    );
    
    console.log('Order post transaction:', tx.hash);
    const receipt = await tx.wait();
    
    // Extract order ID from events
    const orderPostedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = this.contract!.interface.parseLog(log);
        return parsed?.name === 'OrderPosted';
      } catch {
        return false;
      }
    });

    if (orderPostedEvent) {
      const parsed = this.contract.interface.parseLog(orderPostedEvent);
      const orderId = parsed?.args[0].toString();
      console.log('Order posted with ID:', orderId);
      return orderId;
    }
    
    return null;
  }

  async confirmOrder(orderId: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    console.log('Confirming order:', orderId);
    const tx = await this.contract.confirmOrder(orderId);
    console.log('Order confirmation transaction:', tx.hash);
    await tx.wait();
    return tx.hash;
  }

  async payAgent(orderId: string, amountInEth: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    console.log('Paying agent for order:', orderId, 'Amount:', amountInEth);
    
    const tx = await this.contract.payAgent(orderId, {
      value: ethers.parseEther(amountInEth)
    });
    
    console.log('Payment transaction:', tx.hash);
    await tx.wait();
    return tx.hash;
  }

  async getOrder(orderId: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.getOrder(orderId);
  }

  async getAgent(address: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.getAgent(address);
  }

  async listenToPaymentEvents(callback: (event: any) => void) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    this.contract.on('PaymentMade', (orderId, customer, agent, amount, isETH, event) => {
      console.log('Payment event received:', { orderId: orderId.toString(), customer, agent, amount: ethers.formatEther(amount), isETH });
      callback({
        orderId: orderId.toString(),
        customer,
        agent,
        amount: ethers.formatEther(amount),
        isETH,
        transactionHash: event.transactionHash
      });
    });
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
