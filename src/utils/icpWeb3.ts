
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

// Use Internet Computer mainnet configuration
const IC_HOST = 'https://ic0.app';
const IDENTITY_PROVIDER = 'https://identity.ic0.app';

// Use the Internet Computer's NNS Ledger canister for ICP transactions
const ICP_LEDGER_CANISTER_ID = 'rrkah-fqaaa-aaaaa-aaaaq-cai'; // Official ICP Ledger canister

// IDL for ICP Ledger canister
export const ledgerIdlFactory = ({ IDL }: any) => {
  const Tokens = IDL.Record({ e8s: IDL.Nat64 });
  const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const BlockIndex = IDL.Nat64;
  
  const TransferArgs = IDL.Record({
    memo: IDL.Nat64,
    amount: Tokens,
    fee: Tokens,
    from_subaccount: IDL.Opt(SubAccount),
    to: AccountIdentifier,
    created_at_time: IDL.Opt(TimeStamp),
  });

  const TransferResult = IDL.Variant({
    Ok: BlockIndex,
    Err: IDL.Variant({
      BadFee: IDL.Record({ expected_fee: Tokens }),
      InsufficientFunds: IDL.Record({ balance: Tokens }),
      TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
      TxCreatedInFuture: IDL.Null,
      TxDuplicate: IDL.Record({ duplicate_of: BlockIndex }),
    }),
  });

  const AccountBalanceArgs = IDL.Record({
    account: AccountIdentifier,
  });

  return IDL.Service({
    transfer: IDL.Func([TransferArgs], [TransferResult], []),
    account_balance: IDL.Func([AccountBalanceArgs], [Tokens], ['query']),
    symbol: IDL.Func([], [IDL.Record({ symbol: IDL.Text })], ['query']),
    decimals: IDL.Func([], [IDL.Record({ decimals: IDL.Nat32 })], ['query']),
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

    // Create ledger actor for ICP transactions
    this.ledgerActor = Actor.createActor(ledgerIdlFactory, {
      agent: this.agent,
      canisterId: ICP_LEDGER_CANISTER_ID,
    });

    // For demo purposes, we'll simulate a delivery platform canister
    // In production, you would deploy your own canister
    console.log('ICP Actors created successfully');
  }

  // Convert principal to account identifier for ICP ledger
  private principalToAccountIdentifier(principal: Principal): Uint8Array {
    const sha224 = require('js-sha256').sha224;
    const prefix = new Uint8Array([10, 97, 99, 99, 111, 117, 110, 116, 45, 105, 100]); // "account-id"
    const principalBytes = principal.toUint8Array();
    const subAccount = new Uint8Array(32); // Default subaccount (all zeros)
    
    const hash = sha224.create();
    hash.update(prefix);
    hash.update(principalBytes);
    hash.update(subAccount);
    
    const hashArray = hash.array();
    const crc32 = this.crc32(new Uint8Array(hashArray));
    
    const accountId = new Uint8Array(32);
    accountId.set(crc32, 0);
    accountId.set(hashArray.slice(0, 28), 4);
    
    return accountId;
  }

  private crc32(data: Uint8Array): Uint8Array {
    const crcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let crc = i;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
      }
      crcTable[i] = crc;
    }

    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    }
    crc = crc ^ 0xFFFFFFFF;

    const result = new Uint8Array(4);
    result[0] = (crc >>> 24) & 0xFF;
    result[1] = (crc >>> 16) & 0xFF;
    result[2] = (crc >>> 8) & 0xFF;
    result[3] = crc & 0xFF;
    
    return result;
  }

  async getBalance() {
    if (!this.ledgerActor || !this.identity) {
      throw new Error('Ledger actor or identity not available');
    }

    try {
      const principal = this.identity.getPrincipal();
      const accountId = this.principalToAccountIdentifier(principal);
      
      const balance = await this.ledgerActor.account_balance({ account: accountId });
      const icpBalance = Number(balance.e8s) / 100000000; // Convert e8s to ICP
      
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
      const toAccountId = this.principalToAccountIdentifier(recipient);
      
      const amountE8s = BigInt(Math.floor(amountICP * 100000000)); // Convert ICP to e8s
      const feeE8s = BigInt(10000); // Standard ICP transfer fee (0.0001 ICP)
      
      const transferArgs = {
        memo: BigInt(Date.now()),
        amount: { e8s: amountE8s },
        fee: { e8s: feeE8s },
        from_subaccount: [],
        to: toAccountId,
        created_at_time: []
      };

      const result = await this.ledgerActor.transfer(transferArgs);
      
      if ('Ok' in result) {
        const blockIndex = result.Ok;
        console.log(`ICP transfer successful! Block index: ${blockIndex}`);
        return blockIndex.toString();
      } else {
        const error = result.Err;
        console.error('ICP transfer failed:', error);
        
        if ('InsufficientFunds' in error) {
          throw new Error('Insufficient ICP balance for transfer');
        } else if ('BadFee' in error) {
          throw new Error('Incorrect fee amount');
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
      
      // Execute real ICP transfer
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
