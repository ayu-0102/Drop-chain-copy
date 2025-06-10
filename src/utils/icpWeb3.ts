
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

// Production environment - always use mainnet
const CANISTER_ID = 'rdmx6-jaaaa-aaaah-qdrva-cai';
const IC_HOST = 'https://ic0.app';
const IDENTITY_PROVIDER = 'https://identity.ic0.app';

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
        await this.createActor();
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
      await this.createActor();
      
      const principal = this.identity.getPrincipal().toString();
      console.log('Internet Identity connected with principal:', principal);
      
      return principal;
    } catch (error) {
      console.error('Failed to connect to Internet Identity:', error);
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

    console.log('ICP Actor created successfully');
  }

  async registerAgent(name: string) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    console.log('Registering agent on ICP:', name);
    
    try {
      const result = await this.actor.registerAgent(name);
      
      if ('ok' in result) {
        console.log('Agent registered successfully on ICP:', result.ok);
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error registering agent on ICP:', error);
      throw error;
    }
  }

  async postOrder(
    restaurant: string,
    dish: string,
    quantity: number,
    pickupLocation: string,
    dropLocation: string,
    amountInICP: string
  ) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    console.log('Posting order to ICP blockchain:', { restaurant, dish, quantity, pickupLocation, dropLocation, amountInICP });
    
    try {
      const amount = parseFloat(amountInICP);
      const result = await this.actor.postOrder(
        restaurant,
        dish,
        quantity,
        pickupLocation,
        dropLocation,
        amount
      );
      
      if ('ok' in result) {
        console.log('Order posted successfully to ICP with ID:', result.ok);
        return result.ok.toString();
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error posting order to ICP:', error);
      throw error;
    }
  }

  async confirmOrder(orderId: string) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    console.log('Confirming order on ICP:', orderId);
    
    try {
      const result = await this.actor.confirmOrder(parseInt(orderId));
      
      if ('ok' in result) {
        console.log('Order confirmed successfully on ICP:', result.ok);
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error confirming order on ICP:', error);
      throw error;
    }
  }

  async payAgent(orderId: string, amountInICP: string, agentWalletAddress: string) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    console.log('Initiating ICP payment to agent...', { orderId, amountInICP, agentWalletAddress });
    
    try {
      const amount = parseFloat(amountInICP);
      const result = await this.actor.payAgent(parseInt(orderId), amount);
      
      if ('ok' in result) {
        console.log('ICP payment successful:', result.ok);
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('ICP payment failed:', error);
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
      console.error('Error getting order from ICP:', error);
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
      console.error('Error getting agent from ICP:', error);
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
        await this.createActor();
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
      this.actor = null;
    }
  }
}

export const icpWeb3Service = new ICPWeb3Service();
export { CANISTER_ID };
