
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
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, DELIVERY_PLATFORM_ABI, this.signer);
      return true;
    }
    return false;
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    await this.initialize();
    return await this.signer?.getAddress();
  }

  async registerAgent(name: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.registerAgent(name);
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
    
    const tx = await this.contract.postOrder(
      restaurant,
      dish,
      quantity,
      pickupLocation,
      dropLocation,
      { value: ethers.parseEther(amountInEth) }
    );
    
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
      return parsed?.args[0].toString(); // orderId
    }
    
    return null;
  }

  async confirmOrder(orderId: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.confirmOrder(orderId);
    await tx.wait();
    return tx.hash;
  }

  async payAgent(orderId: string, amountInEth: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.payAgent(orderId, {
      value: ethers.parseEther(amountInEth)
    });
    
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
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }
}

export const web3Service = new Web3Service();
