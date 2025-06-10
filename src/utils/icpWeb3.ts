import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

// Safely get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string) => {
  try {
    return process?.env?.[key] || fallback;
  } catch {
    return fallback;
  }
};

const getNodeEnv = () => {
  try {
    return process?.env?.NODE_ENV || 'development';
  } catch {
    return 'development';
  }
};

// Canister ID - will be set after deployment
export const CANISTER_ID = getEnvVar('REACT_APP_CANISTER_ID', 'rdmx6-jaaaa-aaaah-qdrva-cai');

// IDL (Interface Description Language) for the Motoko contract
export const idlFactory = ({ IDL }: any) => {
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

  const Agent = IDL.Record({
    'agentAddress' : IDL.Principal,
    'name' : IDL.Text,
    'rating' : IDL.Float64,
    'totalDeliveries' : IDL.Nat,
    'isActive' : IDL.Bool,
  });

  const OrderResult = IDL.Variant({ 'ok' : Order, 'err' : IDL.Text });
  const AgentResult = IDL.Variant({ 'ok' : Agent, 'err' : IDL.Text });
  const TransactionResult = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const OrderIdResult = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });

  return IDL.Service({
    'registerAgent' : IDL.Func([IDL.Text], [TransactionResult], []),
    'postOrder' : IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Float64],
      [OrderIdResult],
      [],
    ),
    'confirmOrder' : IDL.Func([IDL.Nat], [TransactionResult], []),
    'completeDelivery' : IDL.Func([IDL.Nat], [TransactionResult], []),
    'payAgent' : IDL.Func([IDL.Nat, IDL.Float64], [TransactionResult], []),
    'getOrder' : IDL.Func([IDL.Nat], [OrderResult], ['query']),
    'getAgent' : IDL.Func([IDL.Principal], [AgentResult], ['query']),
    'getCustomerOrders' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat)], ['query']),
    'getAgentOrders' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat)], ['query']),
    'getNextOrderId' : IDL.Func([], [IDL.Nat], ['query']),
    'getPlatformFeePercent' : IDL.Func([], [IDL.Float64], ['query']),
    'setPlatformFee' : IDL.Func([IDL.Float64], [TransactionResult], []),
    'init' : IDL.Func([], [], []),
  });
};

export class ICPWeb3Service {
  private authClient: AuthClient | null = null;
  private actor: any = null;
  private agent: HttpAgent | null = null;
  private identity: any = null;

  async initialize() {
    console.log('Initializing ICP Web3 Service...');
    
    try {
      this.authClient = await AuthClient.create();
      
      // Create agent with proper host configuration
      const nodeEnv = getNodeEnv();
      const host = nodeEnv === 'production' 
        ? 'https://ic0.app' 
        : 'http://localhost:4943';
      
      this.agent = new HttpAgent({ host });

      // Fetch root key for local development
      if (nodeEnv !== 'production') {
        await this.agent.fetchRootKey();
      }

      console.log('ICP Web3 Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing ICP Web3 Service:', error);
      return false;
    }
  }

  async connectWallet() {
    console.log('Attempting to connect ICP wallet...');
    
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    try {
      // Check if already authenticated
      if (await this.authClient.isAuthenticated()) {
        this.identity = this.authClient.getIdentity();
        await this.createActor();
        const principal = this.identity.getPrincipal().toString();
        console.log('Already authenticated with principal:', principal);
        return principal;
      }

      // Login with Internet Identity
      const nodeEnv = getNodeEnv();
      const identityProvider = nodeEnv === 'production' 
        ? 'https://identity.ic0.app'
        : 'http://localhost:4943?canisterId=rdmx6-jaaaa-aaaah-qdrva-cai';

      console.log('Using Internet Identity provider:', identityProvider);

      await new Promise<void>((resolve, reject) => {
        this.authClient!.login({
          identityProvider,
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
      await this.createActor();
      
      const principal = this.identity.getPrincipal().toString();
      console.log('Wallet connected with principal:', principal);
      
      return principal;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  private async createActor() {
    if (!this.agent || !this.identity) {
      throw new Error('Agent or identity not available');
    }

    // Update agent identity
    this.agent.replaceIdentity(this.identity);

    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId: CANISTER_ID,
    });

    console.log('Actor created successfully');
  }

  async registerAgent(name: string) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    console.log('Registering agent:', name);
    
    try {
      const result = await this.actor.registerAgent(name);
      
      if ('ok' in result) {
        console.log('Agent registered successfully:', result.ok);
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error registering agent:', error);
      throw error;
    }
  }

  async postOrder(
    restaurant: string,
    dish: string,
    quantity: number,
    pickupLocation: string,
    dropLocation: string,
    amountInEth: string
  ) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    console.log('Posting order:', { restaurant, dish, quantity, pickupLocation, dropLocation, amountInEth });
    
    try {
      const amount = parseFloat(amountInEth);
      const result = await this.actor.postOrder(
        restaurant,
        dish,
        quantity,
        pickupLocation,
        dropLocation,
        amount
      );
      
      if ('ok' in result) {
        console.log('Order posted successfully with ID:', result.ok);
        return result.ok.toString();
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error posting order:', error);
      throw error;
    }
  }

  async confirmOrder(orderId: string) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    console.log('Confirming order:', orderId);
    
    try {
      const result = await this.actor.confirmOrder(parseInt(orderId));
      
      if ('ok' in result) {
        console.log('Order confirmed successfully:', result.ok);
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  }

  async payAgent(orderId: string, amountInEth: string, agentWalletAddress: string) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    console.log('Initiating payment to agent...', { orderId, amountInEth, agentWalletAddress });
    
    try {
      const amount = parseFloat(amountInEth);
      const result = await this.actor.payAgent(parseInt(orderId), amount);
      
      if ('ok' in result) {
        console.log('Payment successful:', result.ok);
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }

  async getOrder(orderId: string) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    try {
      const result = await this.actor.getOrder(parseInt(orderId));
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }

  async getAgent(principal: string) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    try {
      const agentPrincipal = Principal.fromText(principal);
      const result = await this.actor.getAgent(agentPrincipal);
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error getting agent:', error);
      return null;
    }
  }

  async getWalletAddress() {
    if (!this.identity) {
      console.log('No identity available');
      return null;
    }
    
    try {
      const principal = this.identity.getPrincipal().toString();
      console.log('Current wallet principal:', principal);
      return principal;
    } catch (error) {
      console.error('Error getting wallet address:', error);
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
        await this.createActor();
      }
      return isAuthenticated;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.authClient) {
      await this.authClient.logout();
      this.identity = null;
      this.actor = null;
    }
  }
}

export const icpWeb3Service = new ICPWeb3Service();
