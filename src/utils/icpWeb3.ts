
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

// Use Internet Computer mainnet configuration
const IC_HOST = 'https://ic0.app';
const IDENTITY_PROVIDER = 'https://identity.ic0.app';

// Use the correct ICRC-1 ICP Ledger canister for ICP transactions
const ICP_LEDGER_CANISTER_ID = 'rrkah-fqaaa-aaaaa-aaaaq-cai'; // Official ICP Ledger canister

// ICRC-1 IDL for ICP Ledger canister (correct interface)
export const icrc1LedgerIdlFactory = ({ IDL }: any) => {
  const Tokens = IDL.Nat;
  const Timestamp = IDL.Nat64;
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  
  const TransferArgs = IDL.Record({
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    to: Account,
    amount: Tokens,
    fee: IDL.Opt(Tokens),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(Timestamp),
  });

  const TransferResult = IDL.Variant({
    Ok: IDL.Nat,
    Err: IDL.Variant({
      BadFee: IDL.Record({ expected_fee: Tokens }),
      BadBurn: IDL.Record({ min_burn_amount: Tokens }),
      InsufficientFunds: IDL.Record({ balance: Tokens }),
      TooOld: IDL.Null,
      CreatedInFuture: IDL.Record({ ledger_time: Timestamp }),
      Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
      TemporarilyUnavailable: IDL.Null,
      GenericError: IDL.Record({ error_code: IDL.Nat, message: IDL.Text }),
    }),
  });

  return IDL.Service({
    icrc1_transfer: IDL.Func([TransferArgs], [TransferResult], []),
    icrc1_balance_of: IDL.Func([Account], [Tokens], ['query']),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], ['query']),
    icrc1_fee: IDL.Func([], [Tokens], ['query']),
    icrc1_name: IDL.Func([], [IDL.Text], ['query']),
    icrc1_symbol: IDL.Func([], [IDL.Text], ['query']),
  });
};

// Simple delivery platform IDL for demo purposes
export const deliveryIdlFactory = ({ IDL }: any) => {
  const OrderStatus = IDL.Variant({
    'Posted' : IDL.Null,
    'Confirmed' : IDL.Null,
    'InProgress' : IDL.Null,
    'Delivered' : IDL.Null,
    'Completed' : IDL.Null,
    'Cancelled' : IDL.Null,
  });

  const Order = IDL.Record({
    'orderId' : IDL.Nat,
    'customer' : IDL.Principal,
    'agent' : IDL.Opt(IDL.Principal),
    'restaurant' : IDL.Text,
    'dish' : IDL.Text,
    'quantity' : IDL.Nat,
    'amount' : IDL.Float64,
    'pickupLocation' : IDL.Text,
    'dropLocation' : IDL.Text,
    'status' : OrderStatus,
    'createdAt' : IDL.Int,
    'confirmedAt' : IDL.Opt(IDL.Int),
    'completedAt' : IDL.Opt(IDL.Int),
  });

  const TransactionResult = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const OrderIdResult = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });

  return IDL.Service({
    'postOrder' : IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Float64],
      [OrderIdResult],
      [],
    ),
    'confirmOrder' : IDL.Func([IDL.Nat], [TransactionResult], []),
    'getOrder' : IDL.Func([IDL.Nat], [IDL.Opt(Order)], ['query']),
    'getNextOrderId' : IDL.Func([], [IDL.Nat], ['query']),
  });
};

export class ICPWeb3Service {
  private authClient: AuthClient | null = null;
  private ledgerActor: any = null;
  private deliveryActor: any = null;
  private agent: HttpAgent | null = null;
  private identity: any = null;

  async initialize() {
    console.log('Initializing ICP Web3 Service for mainnet...');
    
    try {
      this.authClient = await AuthClient.create();
      
      // Create agent for Internet Computer mainnet
      this.agent = new HttpAgent({ host: IC_HOST });

      console.log('ICP Web3 Service initialized successfully for mainnet');
      return true;
    } catch (error) {
      console.error('Error initializing ICP Web3 Service:', error);
      return false;
    }
  }

  async connectWallet() {
    console.log('Connecting to Internet Identity...');
    
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    try {
      // Check if already authenticated
      if (await this.authClient.isAuthenticated()) {
        this.identity = this.authClient.getIdentity();
        await this.createActors();
        const principal = this.identity.getPrincipal().toString();
        console.log('Already authenticated with principal:', principal);
        return principal;
      }

      // Login with Internet Identity mainnet
      console.log('Redirecting to Internet Identity:', IDENTITY_PROVIDER);

      await new Promise<void>((resolve, reject) => {
        this.authClient!.login({
          identityProvider: IDENTITY_PROVIDER,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
          onSuccess: () => {
            console.log('Internet Identity login successful');
            resolve();
          },
          onError: (error) => {
            console.error('Internet Identity login failed:', error);
            reject(new Error(`Login failed: ${error}`));
          },
        });
      });

      this.identity = this.authClient.getIdentity();
      await this.createActors();
      
      const principal = this.identity.getPrincipal().toString();
      console.log('Internet Identity connected with principal:', principal);
      
      return principal;
    } catch (error) {
      console.error('Failed to connect to Internet Identity:', error);
      throw error;
    }
  }

  private async createActors() {
    if (!this.agent || !this.identity) {
      throw new Error('Agent or identity not available');
    }

    // Update agent identity
    this.agent.replaceIdentity(this.identity);

    // Create ledger actor for ICP transactions using ICRC-1 interface
    this.ledgerActor = Actor.createActor(icrc1LedgerIdlFactory, {
      agent: this.agent,
      canisterId: ICP_LEDGER_CANISTER_ID,
    });

    console.log('ICP ICRC-1 Actors created successfully');
  }

  async getBalance() {
    if (!this.ledgerActor || !this.identity) {
      throw new Error('Ledger actor or identity not available');
    }

    try {
      const principal = this.identity.getPrincipal();
      const account = {
        owner: principal,
        subaccount: [],
      };
      
      const balance = await this.ledgerActor.icrc1_balance_of(account);
      const icpBalance = Number(balance) / 100000000; // Convert e8s to ICP
      
      console.log(`ICP Balance: ${icpBalance} ICP`);
      return icpBalance;
    } catch (error) {
      console.error('Error getting ICP balance:', error);
      return 0;
    }
  }

  async transferICP(toPrincipal: string, amountICP: number) {
    if (!this.ledgerActor || !this.identity) {
      throw new Error('Ledger actor or identity not available');
    }

    try {
      console.log(`Transferring ${amountICP} ICP to ${toPrincipal}`);
      
      const recipient = Principal.fromText(toPrincipal);
      const amountE8s = BigInt(Math.floor(amountICP * 100000000)); // Convert ICP to e8s
      
      // Get current fee from ledger
      const fee = await this.ledgerActor.icrc1_fee();
      console.log('Current ICP transfer fee:', Number(fee) / 100000000, 'ICP');
      
      const transferArgs = {
        from_subaccount: [],
        to: {
          owner: recipient,
          subaccount: [],
        },
        amount: amountE8s,
        fee: [fee], // Optional fee, let ledger handle it
        memo: [],
        created_at_time: [BigInt(Date.now() * 1000000)] // Convert to nanoseconds
      };

      console.log('Initiating ICRC-1 ICP transfer with args:', {
        ...transferArgs,
        amount: `${amountICP} ICP (${amountE8s} e8s)`,
        fee: `${Number(fee) / 100000000} ICP`
      });

      const result = await this.ledgerActor.icrc1_transfer(transferArgs);
      
      if ('Ok' in result) {
        const blockIndex = result.Ok;
        console.log(`ICP transfer successful! Block index: ${blockIndex}`);
        return blockIndex.toString();
      } else {
        const error = result.Err;
        console.error('ICP transfer failed:', error);
        
        if ('InsufficientFunds' in error) {
          const balance = Number(error.InsufficientFunds.balance) / 100000000;
          throw new Error(`Insufficient ICP balance. Current balance: ${balance} ICP`);
        } else if ('BadFee' in error) {
          const expectedFee = Number(error.BadFee.expected_fee) / 100000000;
          throw new Error(`Incorrect fee. Expected fee: ${expectedFee} ICP`);
        } else if ('GenericError' in error) {
          throw new Error(`Transfer failed: ${error.GenericError.message}`);
        } else {
          throw new Error(`Transfer failed: ${JSON.stringify(error)}`);
        }
      }
    } catch (error) {
      console.error('Error transferring ICP:', error);
      throw error;
    }
  }

  // Demo functions for order management
  async postOrder(restaurant: string, dish: string, quantity: number, pickup: string, drop: string, amount: string) {
    console.log('Creating order (demo):', { restaurant, dish, quantity, pickup, drop, amount });
    
    // For demo purposes, generate a random order ID
    const orderId = Date.now().toString();
    
    // Store order locally for demo
    const order = {
      orderId,
      restaurant,
      dish,
      quantity,
      pickup,
      drop,
      amount: parseFloat(amount),
      customer: this.identity?.getPrincipal().toString(),
      status: 'Posted',
      createdAt: Date.now()
    };
    
    localStorage.setItem(`order_${orderId}`, JSON.stringify(order));
    console.log('Order created with ID:', orderId);
    
    return orderId;
  }

  async confirmOrder(orderId: string) {
    console.log('Confirming order:', orderId);
    
    // For demo purposes
    const orderData = localStorage.getItem(`order_${orderId}`);
    if (orderData) {
      const order = JSON.parse(orderData);
      order.status = 'Confirmed';
      order.confirmedAt = Date.now();
      localStorage.setItem(`order_${orderId}`, JSON.stringify(order));
    }
    
    return 'Order confirmed successfully';
  }

  async payAgent(orderId: string, amountInICP: string, agentPrincipal: string) {
    console.log('Paying agent with ICP:', { orderId, amountInICP, agentPrincipal });
    
    try {
      const amount = parseFloat(amountInICP);
      
      // Check balance first
      const balance = await this.getBalance();
      console.log('Current ICP balance:', balance);
      
      if (balance < amount) {
        throw new Error(`Insufficient balance. You have ${balance} ICP but need ${amount} ICP`);
      }
      
      // Execute real ICP transfer using ICRC-1
      const txHash = await this.transferICP(agentPrincipal, amount);
      
      console.log('ICP payment successful! Transaction:', txHash);
      
      // Update order status
      const orderData = localStorage.getItem(`order_${orderId}`);
      if (orderData) {
        const order = JSON.parse(orderData);
        order.status = 'Completed';
        order.completedAt = Date.now();
        order.txHash = txHash;
        localStorage.setItem(`order_${orderId}`, JSON.stringify(order));
      }
      
      return txHash;
    } catch (error) {
      console.error('ICP payment failed:', error);
      throw error;
    }
  }

  async registerAgent(name: string) {
    console.log('Registering agent (demo):', name);
    
    if (!this.identity) {
      throw new Error('Not authenticated');
    }
    
    const principal = this.identity.getPrincipal().toString();
    const agent = {
      principal,
      name,
      rating: 4.5,
      totalDeliveries: 0,
      isActive: true,
      registeredAt: Date.now()
    };
    
    localStorage.setItem(`agent_${principal}`, JSON.stringify(agent));
    console.log('Agent registered successfully');
    
    return 'Agent registered successfully';
  }

  async getWalletAddress() {
    if (!this.identity) {
      console.log('No identity available');
      return null;
    }
    
    try {
      const principal = this.identity.getPrincipal().toString();
      console.log('Current ICP principal:', principal);
      return principal;
    } catch (error) {
      console.error('Error getting ICP principal:', error);
      return null;
    }
  }

  async checkConnection() {
    if (!this.authClient) {
      return false;
    }
    
    try {
      const isAuthenticated = await this.authClient.isAuthenticated();
      if (isAuthenticated) {
        this.identity = this.authClient.getIdentity();
        await this.createActors();
      }
      return isAuthenticated;
    } catch (error) {
      console.error('Error checking ICP connection:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.authClient) {
      await this.authClient.logout();
      this.identity = null;
      this.ledgerActor = null;
      this.deliveryActor = null;
    }
  }
}

export const icpWeb3Service = new ICPWeb3Service();
export { ICP_LEDGER_CANISTER_ID as CANISTER_ID };
