// Demo Payment Service for showcasing to judges
// Simulates real ICP transactions without requiring actual tokens

export interface DemoTransaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  currency: 'ICP';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  blockHeight: number;
  gasUsed: string;
  transactionFee: string;
  memo?: string;
}

export interface DemoPaymentNotification {
  id: string;
  orderId: string;
  customerName: string;
  customerWallet: string;
  agentName: string;
  agentWallet: string;
  amount: string;
  currency: 'ICP';
  txHash: string;
  timestamp: string;
  status: 'received';
  orderDetails: {
    restaurant: string;
    dish: string;
    location: string;
  };
  blockchainData: {
    blockHeight: number;
    gasUsed: string;
    transactionFee: string;
    confirmations: number;
  };
}

class DemoPaymentService {
  private transactions: DemoTransaction[] = [];
  private notifications: DemoPaymentNotification[] = [];

  // Generate realistic transaction hash
  private generateTxHash(): string {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }

  // Generate realistic block height
  private generateBlockHeight(): number {
    return Math.floor(Math.random() * 1000000) + 5000000;
  }

  // Simulate ICP transaction with realistic delays and confirmations
  async simulateICPPayment(
    fromWallet: string,
    toWallet: string,
    amount: string,
    orderId: string,
    orderDetails: any
  ): Promise<DemoTransaction> {
    console.log('🚀 Starting Demo ICP Payment Simulation');
    console.log('From:', fromWallet);
    console.log('To:', toWallet);
    console.log('Amount:', amount, 'ICP');

    // Create transaction object
    const transaction: DemoTransaction = {
      id: this.generateTxHash(),
      from: fromWallet,
      to: toWallet,
      amount: amount,
      currency: 'ICP',
      status: 'pending',
      timestamp: new Date().toISOString(),
      blockHeight: this.generateBlockHeight(),
      gasUsed: '0.0001',
      transactionFee: '0.0001',
      memo: `Payment for order ${orderId}`
    };

    this.transactions.push(transaction);

    // Simulate network delay (1-3 seconds)
    const delay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate transaction confirmation
    transaction.status = 'confirmed';
    console.log('✅ Demo ICP Transaction Confirmed:', transaction.id);

    // Create payment notification for agent
    const notification: DemoPaymentNotification = {
      id: `notif_${Date.now()}`,
      orderId: orderId,
      customerName: orderDetails.customerName || 'John Doe',
      customerWallet: fromWallet,
      agentName: orderDetails.agentName || 'Delivery Agent',
      agentWallet: toWallet,
      amount: amount,
      currency: 'ICP',
      txHash: transaction.id,
      timestamp: new Date().toISOString(),
      status: 'received',
      orderDetails: {
        restaurant: orderDetails.restaurant || 'Restaurant',
        dish: orderDetails.dish || 'Food Item',
        location: orderDetails.location || 'Delivery Location'
      },
      blockchainData: {
        blockHeight: transaction.blockHeight,
        gasUsed: transaction.gasUsed,
        transactionFee: transaction.transactionFee,
        confirmations: Math.floor(Math.random() * 10) + 1
      }
    };

    this.notifications.push(notification);

    // Store notification for agent to see
    this.storeAgentNotification(notification);

    return transaction;
  }

  // Store notification in localStorage for agent dashboard
  private storeAgentNotification(notification: DemoPaymentNotification) {
    const existingNotifications = localStorage.getItem('agentPayments');
    const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    
    notifications.unshift(notification);
    localStorage.setItem('agentPayments', JSON.stringify(notifications));
    
    console.log('💰 Payment notification stored for agent:', notification.agentName);
  }

  // Get transaction by ID
  getTransaction(txId: string): DemoTransaction | null {
    return this.transactions.find(tx => tx.id === txId) || null;
  }

  // Get all transactions for a wallet
  getTransactionsForWallet(wallet: string): DemoTransaction[] {
    return this.transactions.filter(tx => tx.from === wallet || tx.to === wallet);
  }

  // Get payment notifications for agent
  getAgentNotifications(agentWallet: string): DemoPaymentNotification[] {
    return this.notifications.filter(notif => notif.agentWallet === agentWallet);
  }

  // Simulate checking ICP balance (always returns sufficient balance for demo)
  async getDemoBalance(wallet: string): Promise<number> {
    // Return a realistic demo balance
    return 10.5 + Math.random() * 5; // Between 10.5 and 15.5 ICP
  }

  // Clear all demo data (for resetting demo)
  clearDemoData() {
    this.transactions = [];
    this.notifications = [];
    localStorage.removeItem('agentPayments');
    localStorage.removeItem('agentConfirmations');
    localStorage.removeItem('deliveryJobs');
    console.log('🧹 Demo data cleared');
  }

  // Generate demo transaction history for showcase
  generateDemoHistory(wallet: string) {
    const demoTxs: DemoTransaction[] = [
      {
        id: this.generateTxHash(),
        from: wallet,
        to: 'agent_demo_wallet_1',
        amount: '0.05',
        currency: 'ICP',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        blockHeight: this.generateBlockHeight() - 100,
        gasUsed: '0.0001',
        transactionFee: '0.0001',
        memo: 'Payment for pizza delivery'
      },
      {
        id: this.generateTxHash(),
        from: wallet,
        to: 'agent_demo_wallet_2',
        amount: '0.03',
        currency: 'ICP',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        blockHeight: this.generateBlockHeight() - 200,
        gasUsed: '0.0001',
        transactionFee: '0.0001',
        memo: 'Payment for burger delivery'
      }
    ];

    this.transactions.push(...demoTxs);
    return demoTxs;
  }
}

export const demoPaymentService = new DemoPaymentService();