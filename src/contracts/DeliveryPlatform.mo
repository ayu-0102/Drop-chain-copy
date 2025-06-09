import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Float "mo:base/Float";

actor DeliveryPlatform {
    
    // Types
    public type OrderStatus = {
        #Posted;
        #Confirmed;
        #InProgress;
        #Delivered;
        #Completed;
        #Cancelled;
    };

    public type Order = {
        orderId: Nat;
        customer: Principal;
        agent: ?Principal;
        restaurant: Text;
        dish: Text;
        quantity: Nat;
        amount: Float; // Using Float for ETH amounts
        pickupLocation: Text;
        dropLocation: Text;
        status: OrderStatus;
        createdAt: Int;
        confirmedAt: ?Int;
        completedAt: ?Int;
    };

    public type Agent = {
        agentAddress: Principal;
        name: Text;
        rating: Float;
        totalDeliveries: Nat;
        isActive: Bool;
    };

    public type OrderResult = Result.Result<Order, Text>;
    public type AgentResult = Result.Result<Agent, Text>;
    public type TransactionResult = Result.Result<Text, Text>;

    // State variables
    private stable var nextOrderId: Nat = 1;
    private stable var platformFeePercent: Float = 5.0; // 5% platform fee
    private stable var owner: Principal = Principal.fromText("rdmx6-jaaaa-aaaah-qdrva-cai"); // Default owner

    // Storage
    private var orders = HashMap.HashMap<Nat, Order>(10, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private var agents = HashMap.HashMap<Principal, Agent>(10, Principal.equal, Principal.hash);
    private var customerOrders = HashMap.HashMap<Principal, [Nat]>(10, Principal.equal, Principal.hash);
    private var agentOrders = HashMap.HashMap<Principal, [Nat]>(10, Principal.equal, Principal.hash);

    // Events (stored for querying)
    private stable var orderPostedEvents: [(Nat, Principal, Float)] = [];
    private stable var orderConfirmedEvents: [(Nat, Principal)] = [];
    private stable var orderCompletedEvents: [(Nat, Principal, Principal, Float)] = [];

    // Initialize owner
    public func init() : async () {
        owner := Principal.fromActor(DeliveryPlatform);
    };

    // Agent registration
    public func registerAgent(name: Text) : async TransactionResult {
        let caller = Principal.fromActor(DeliveryPlatform); // In real implementation, use msg.caller equivalent
        
        if (Text.size(name) == 0) {
            return #err("Name cannot be empty");
        };

        let agent: Agent = {
            agentAddress = caller;
            name = name;
            rating = 5.0; // Start with 5.0 rating
            totalDeliveries = 0;
            isActive = true;
        };

        agents.put(caller, agent);
        
        // Generate transaction hash (mock)
        let txHash = "0x" # Nat.toText(Time.now()) # "agent";
        #ok(txHash)
    };

    // Post order
    public func postOrder(
        restaurant: Text,
        dish: Text,
        quantity: Nat,
        pickupLocation: Text,
        dropLocation: Text,
        amount: Float
    ) : async Result.Result<Nat, Text> {
        let caller = Principal.fromActor(DeliveryPlatform); // In real implementation, use msg.caller equivalent
        
        if (amount <= 0.0) {
            return #err("Payment required");
        };
        
        if (Text.size(restaurant) == 0) {
            return #err("Restaurant name required");
        };

        let orderId = nextOrderId;
        nextOrderId += 1;

        let order: Order = {
            orderId = orderId;
            customer = caller;
            agent = null;
            restaurant = restaurant;
            dish = dish;
            quantity = quantity;
            amount = amount;
            pickupLocation = pickupLocation;
            dropLocation = dropLocation;
            status = #Posted;
            createdAt = Time.now();
            confirmedAt = null;
            completedAt = null;
        };

        orders.put(orderId, order);
        
        // Update customer orders
        switch (customerOrders.get(caller)) {
            case (?existing) {
                customerOrders.put(caller, Array.append(existing, [orderId]));
            };
            case null {
                customerOrders.put(caller, [orderId]);
            };
        };

        // Add to events
        orderPostedEvents := Array.append(orderPostedEvents, [(orderId, caller, amount)]);
        
        #ok(orderId)
    };

    // Confirm order
    public func confirmOrder(orderId: Nat) : async TransactionResult {
        let caller = Principal.fromActor(DeliveryPlatform); // In real implementation, use msg.caller equivalent
        
        switch (agents.get(caller)) {
            case (?agent) {
                if (not agent.isActive) {
                    return #err("Agent not registered");
                };
            };
            case null {
                return #err("Agent not registered");
            };
        };

        switch (orders.get(orderId)) {
            case (?order) {
                if (order.status != #Posted) {
                    return #err("Order not available");
                };
                
                if (order.agent != null) {
                    return #err("Order already confirmed");
                };

                let updatedOrder: Order = {
                    orderId = order.orderId;
                    customer = order.customer;
                    agent = ?caller;
                    restaurant = order.restaurant;
                    dish = order.dish;
                    quantity = order.quantity;
                    amount = order.amount;
                    pickupLocation = order.pickupLocation;
                    dropLocation = order.dropLocation;
                    status = #Confirmed;
                    createdAt = order.createdAt;
                    confirmedAt = ?Time.now();
                    completedAt = order.completedAt;
                };

                orders.put(orderId, updatedOrder);

                // Update agent orders
                switch (agentOrders.get(caller)) {
                    case (?existing) {
                        agentOrders.put(caller, Array.append(existing, [orderId]));
                    };
                    case null {
                        agentOrders.put(caller, [orderId]);
                    };
                };

                // Add to events
                orderConfirmedEvents := Array.append(orderConfirmedEvents, [(orderId, caller)]);
                
                let txHash = "0x" # Nat.toText(Time.now()) # "confirm";
                #ok(txHash)
            };
            case null {
                #err("Order not found")
            };
        }
    };

    // Complete delivery
    public func completeDelivery(orderId: Nat) : async TransactionResult {
        let caller = Principal.fromActor(DeliveryPlatform); // In real implementation, use msg.caller equivalent
        
        switch (orders.get(orderId)) {
            case (?order) {
                switch (order.agent) {
                    case (?agent) {
                        if (agent != caller) {
                            return #err("Not your order");
                        };
                    };
                    case null {
                        return #err("No agent assigned");
                    };
                };

                if (order.status != #Confirmed) {
                    return #err("Order not confirmed");
                };

                let updatedOrder: Order = {
                    orderId = order.orderId;
                    customer = order.customer;
                    agent = order.agent;
                    restaurant = order.restaurant;
                    dish = order.dish;
                    quantity = order.quantity;
                    amount = order.amount;
                    pickupLocation = order.pickupLocation;
                    dropLocation = order.dropLocation;
                    status = #Delivered;
                    createdAt = order.createdAt;
                    confirmedAt = order.confirmedAt;
                    completedAt = ?Time.now();
                };

                orders.put(orderId, updatedOrder);
                
                let txHash = "0x" # Nat.toText(Time.now()) # "complete";
                #ok(txHash)
            };
            case null {
                #err("Order not found")
            };
        }
    };

    // Pay agent
    public func payAgent(orderId: Nat, paymentAmount: Float) : async TransactionResult {
        let caller = Principal.fromActor(DeliveryPlatform); // In real implementation, use msg.caller equivalent
        
        switch (orders.get(orderId)) {
            case (?order) {
                if (order.customer != caller) {
                    return #err("Not your order");
                };
                
                if (order.status != #Delivered) {
                    return #err("Order not delivered");
                };

                let platformFee = (paymentAmount * platformFeePercent) / 100.0;
                let agentPayment = paymentAmount - platformFee;

                let updatedOrder: Order = {
                    orderId = order.orderId;
                    customer = order.customer;
                    agent = order.agent;
                    restaurant = order.restaurant;
                    dish = order.dish;
                    quantity = order.quantity;
                    amount = order.amount;
                    pickupLocation = order.pickupLocation;
                    dropLocation = order.dropLocation;
                    status = #Completed;
                    createdAt = order.createdAt;
                    confirmedAt = order.confirmedAt;
                    completedAt = order.completedAt;
                };

                orders.put(orderId, updatedOrder);

                // Update agent stats
                switch (order.agent) {
                    case (?agentPrincipal) {
                        switch (agents.get(agentPrincipal)) {
                            case (?agent) {
                                let updatedAgent: Agent = {
                                    agentAddress = agent.agentAddress;
                                    name = agent.name;
                                    rating = agent.rating;
                                    totalDeliveries = agent.totalDeliveries + 1;
                                    isActive = agent.isActive;
                                };
                                agents.put(agentPrincipal, updatedAgent);
                            };
                            case null {};
                        };

                        // Add to events
                        orderCompletedEvents := Array.append(orderCompletedEvents, [(orderId, caller, agentPrincipal, agentPayment)]);
                    };
                    case null {};
                };
                
                let txHash = "0x" # Nat.toText(Time.now()) # "payment";
                #ok(txHash)
            };
            case null {
                #err("Order not found")
            };
        }
    };

    // Query functions
    public query func getOrder(orderId: Nat) : async OrderResult {
        switch (orders.get(orderId)) {
            case (?order) { #ok(order) };
            case null { #err("Order not found") };
        }
    };

    public query func getAgent(agentAddress: Principal) : async AgentResult {
        switch (agents.get(agentAddress)) {
            case (?agent) { #ok(agent) };
            case null { #err("Agent not found") };
        }
    };

    public query func getCustomerOrders(customer: Principal) : async [Nat] {
        switch (customerOrders.get(customer)) {
            case (?orders) { orders };
            case null { [] };
        }
    };

    public query func getAgentOrders(agent: Principal) : async [Nat] {
        switch (agentOrders.get(agent)) {
            case (?orders) { orders };
            case null { [] };
        }
    };

    public query func getNextOrderId() : async Nat {
        nextOrderId
    };

    public query func getPlatformFeePercent() : async Float {
        platformFeePercent
    };

    // Admin functions
    public func setPlatformFee(newFee: Float) : async TransactionResult {
        let caller = Principal.fromActor(DeliveryPlatform); // In real implementation, use msg.caller equivalent
        
        if (caller != owner) {
            return #err("Only owner can set platform fee");
        };
        
        platformFeePercent := newFee;
        #ok("Platform fee updated")
    };

    // System functions for upgrades
    system func preupgrade() {
        // Convert HashMaps to stable arrays before upgrade
        Debug.print("Preparing for upgrade...");
    };

    system func postupgrade() {
        // Restore HashMaps from stable arrays after upgrade
        Debug.print("Upgrade completed");
    };
}