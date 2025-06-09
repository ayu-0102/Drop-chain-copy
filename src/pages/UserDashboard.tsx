import { useState, useEffect } from 'react';
import { Send, MapPin, Clock, Bot, History, User, CheckCircle, Wallet, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useToast } from '../hooks/use-toast';

interface ExtractedOrderInfo {
  restaurant: string;
  dish: string;
  quantity: number;
  estimatedPrice: string;
  deliveryLocation: string;
  urgency: string;
  userName: string;
  userId: string;
  orderId: string;
}

interface AgentConfirmation {
  orderId: string;
  agentName: string;
  agentWallet: string;
  agentRating: number;
  eta: string;
  pickupTime: string;
  confirmedAt: string;
}

const UserDashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedOrderInfo | null>(null);
  const [orderPosted, setOrderPosted] = useState(false);
  const [agentConfirmation, setAgentConfirmation] = useState<AgentConfirmation | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('0.01');
  const [blockchainOrderId, setBlockchainOrderId] = useState<string | null>(null);
  const [currentOrderDetails, setCurrentOrderDetails] = useState<any>(null);
  
  const navigate = useNavigate();
  const { isConnected, walletAddress, connectWallet, postOrder, payAgent, isLoading, error } = useWeb3();
  const { toast } = useToast();

  // Listen for agent confirmations from localStorage
  useEffect(() => {
    const checkForConfirmations = () => {
      const confirmations = localStorage.getItem('agentConfirmations');
      if (confirmations) {
        const parsed = JSON.parse(confirmations);
        if (parsed.length > 0) {
          const confirmation = parsed[0];
          setAgentConfirmation(confirmation);
          setBlockchainOrderId(confirmation.orderId);
          // Clear the confirmation after showing it
          localStorage.removeItem('agentConfirmations');
        }
      }
    };

    const interval = setInterval(checkForConfirmations, 1000);
    return () => clearInterval(interval);
  }, []);

  // Display connection status
  useEffect(() => {
    if (isConnected && walletAddress) {
      console.log('Wallet connected in UserDashboard:', walletAddress);
    }
  }, [isConnected, walletAddress]);

  // Show error toast when there's a Web3 error
  useEffect(() => {
    if (error) {
      toast({
        title: "Wallet Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleConnectWallet = async () => {
    try {
      console.log('Connect wallet button clicked');
      await connectWallet();
      toast({
        title: "Wallet Connected!",
        description: "You can now place orders and make payments",
      });
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  const recentOrders = [
    {
      id: 1,
      prompt: "Order 2 butter chicken from Punjabi Dhaba",
      status: "Delivered",
      time: "2 hours ago",
      amount: 420
    },
    {
      id: 2,
      prompt: "Get me a veg burger from McDonald's",
      status: "In Progress",
      time: "30 minutes ago",
      amount: 180
    }
  ];

  const extractInfoFromPrompt = (userPrompt: string): ExtractedOrderInfo => {
    // Simple AI simulation - extract information from prompt
    const lowerPrompt = userPrompt.toLowerCase();
    
    // Extract restaurant name
    let restaurant = "Local Restaurant";
    if (lowerPrompt.includes("from")) {
      const fromIndex = lowerPrompt.indexOf("from") + 5;
      const restPart = userPrompt.substring(fromIndex).trim();
      const words = restPart.split(" ");
      restaurant = words.slice(0, 3).join(" ").replace(/for.*/, "").trim();
    }

    // Extract dish name
    let dish = "Food Item";
    const commonDishes = ["dosa", "burger", "pizza", "biryani", "chicken", "naan", "rice", "curry"];
    for (const dishType of commonDishes) {
      if (lowerPrompt.includes(dishType)) {
        const dishIndex = lowerPrompt.indexOf(dishType);
        const beforeDish = userPrompt.substring(Math.max(0, dishIndex - 20), dishIndex + dishType.length + 10);
        dish = beforeDish.split(" ").slice(-3).join(" ").trim();
        break;
      }
    }

    // Extract quantity
    let quantity = 1;
    const quantityMatch = userPrompt.match(/(\d+)/);
    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1]);
    }

    // Generate estimated price based on dish type
    let basePrice = 150;
    if (lowerPrompt.includes("biryani")) basePrice = 250;
    if (lowerPrompt.includes("pizza")) basePrice = 300;
    if (lowerPrompt.includes("burger")) basePrice = 180;
    
    const estimatedPrice = `₹${basePrice * quantity}`;

    return {
      restaurant: restaurant,
      dish: dish,
      quantity: quantity,
      estimatedPrice: estimatedPrice,
      deliveryLocation: userLocation || "Location not specified",
      urgency: "Normal",
      userName: "John Doe",
      userId: "user_123",
      orderId: `order_${Date.now()}`
    };
  };

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) return;
    if (!userLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter your delivery location first!",
        variant: "destructive"
      });
      return;
    }
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const extracted = extractInfoFromPrompt(prompt);
      setExtractedInfo(extracted);
      setIsProcessing(false);
    }, 3000);
  };

  const confirmAndPostOrder = async () => {
    if (!extractedInfo || !isConnected) return;
    
    try {
      console.log('Posting order to blockchain:', extractedInfo);
      
      // Post order to blockchain
      const orderId = await postOrder(
        extractedInfo.restaurant,
        extractedInfo.dish,
        extractedInfo.quantity,
        `${extractedInfo.restaurant}, Koramangala`,
        extractedInfo.deliveryLocation,
        paymentAmount
      );
      
      if (orderId) {
        setBlockchainOrderId(orderId);
        
        // Store current order details for payment
        const orderDetails = {
          orderId: orderId,
          restaurant: extractedInfo.restaurant,
          dish: extractedInfo.dish,
          quantity: extractedInfo.quantity,
          deliveryLocation: extractedInfo.deliveryLocation,
          customerWallet: walletAddress,
          customerName: extractedInfo.userName,
          paymentAmount: paymentAmount
        };
        setCurrentOrderDetails(orderDetails);
        
        // Store in localStorage for local demo
        const existingOrders = localStorage.getItem('deliveryJobs');
        const orders = existingOrders ? JSON.parse(existingOrders) : [];
        
        const newJob = {
          id: orderId,
          customerPrompt: prompt,
          restaurant: extractedInfo.restaurant,
          dish: extractedInfo.dish,
          quantity: extractedInfo.quantity,
          estimatedPay: parseInt(extractedInfo.estimatedPrice.replace('₹', '')),
          pickupLocation: `${extractedInfo.restaurant}, Koramangala`,
          dropLocation: extractedInfo.deliveryLocation,
          distance: "2.1 km",
          timePosted: "Just now",
          urgency: extractedInfo.urgency,
          customerRating: 4.8,
          userName: extractedInfo.userName,
          userId: extractedInfo.userId,
          status: 'available',
          paymentAmount: paymentAmount,
          walletAddress: walletAddress
        };
        
        orders.unshift(newJob);
        localStorage.setItem('deliveryJobs', JSON.stringify(orders));
        
        setOrderPosted(true);
        setPrompt('');
        
        toast({
          title: "Order posted successfully!",
          description: `Order ID: ${orderId} - Visible to delivery agents`,
        });
      }
    } catch (error) {
      console.error('Failed to post order:', error);
      toast({
        title: "Failed to post order",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  };

  const handlePayment = async () => {
    console.log('Payment button clicked');
    console.log('Current order details:', currentOrderDetails);
    console.log('Agent confirmation:', agentConfirmation);
    console.log('Blockchain order ID:', blockchainOrderId);
    console.log('Payment amount:', paymentAmount);
    
    // Enhanced validation with better error messages
    if (!blockchainOrderId) {
      console.error('No blockchain order ID available');
      toast({
        title: "Payment Error",
        description: "Order ID not found. Please try posting the order again.",
        variant: "destructive"
      });
      return;
    }
    
    if (!agentConfirmation) {
      console.error('No agent confirmation available');
      toast({
        title: "Payment Error", 
        description: "No agent has confirmed this order yet. Please wait for agent confirmation.",
        variant: "destructive"
      });
      return;
    }
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Payment Error",
        description: "Invalid payment amount",
        variant: "destructive"
      });
      return;
    }
    
    if (!isConnected || !walletAddress) {
      toast({
        title: "Payment Error",
        description: "Wallet not connected",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Starting payment process...', { 
        orderId: blockchainOrderId, 
        amount: paymentAmount,
        agentName: agentConfirmation.agentName,
        agentWallet: agentConfirmation.agentWallet
      });
      
      toast({
        title: "Payment Processing",
        description: "Please confirm the transaction in MetaMask",
      });
      
      // Send payment through Web3 with agent's wallet address
      const txHash = await payAgent(blockchainOrderId, paymentAmount);
      
      console.log('Payment transaction successful:', txHash);
      
      // Create payment confirmation for agent dashboard
      const paymentConfirmation = {
        orderId: blockchainOrderId,
        customerName: extractedInfo?.userName || currentOrderDetails?.customerName || "John Doe",
        customerWallet: walletAddress,
        agentName: agentConfirmation.agentName,
        agentWallet: agentConfirmation.agentWallet,
        amount: paymentAmount,
        txHash: txHash,
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        blockNumber: Math.floor(Math.random() * 1000000), // Demo block number
        gasUsed: '21000',
        orderDetails: {
          restaurant: extractedInfo?.restaurant || currentOrderDetails?.restaurant,
          dish: extractedInfo?.dish || currentOrderDetails?.dish,
          location: extractedInfo?.deliveryLocation || currentOrderDetails?.deliveryLocation
        }
      };
      
      // Store payment for agent to see
      const existingPayments = localStorage.getItem('agentPayments');
      const payments = existingPayments ? JSON.parse(existingPayments) : [];
      payments.unshift(paymentConfirmation);
      localStorage.setItem('agentPayments', JSON.stringify(payments));
      
      // Update order status to completed
      const existingOrders = localStorage.getItem('deliveryJobs');
      if (existingOrders) {
        const orders = JSON.parse(existingOrders);
        const updatedOrders = orders.map((order: any) => 
          order.id === blockchainOrderId 
            ? { 
                ...order, 
                status: 'completed', 
                paidAmount: paymentAmount, 
                txHash: txHash,
                completedAt: new Date().toISOString()
              }
            : order
        );
        localStorage.setItem('deliveryJobs', JSON.stringify(updatedOrders));
      }
      
      toast({
        title: "Payment Successful! 🎉",
        description: `${paymentAmount} ETH sent to ${agentConfirmation.agentName}. Transaction: ${txHash.slice(0, 10)}...`,
      });
      
      // Reset states after successful payment
      setTimeout(() => {
        setOrderPosted(false);
        setAgentConfirmation(null);
        setExtractedInfo(null);
        setBlockchainOrderId(null);
        setCurrentOrderDetails(null);
        setPaymentAmount('0.01');
      }, 3000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      
      let errorMessage = "Payment failed. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          errorMessage = "Transaction was cancelled by user";
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = "Insufficient funds for transaction";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Food Assistant</h1>
          <p className="text-muted-foreground">Just tell me what you want to order!</p>
        </div>
        <div className="flex items-center space-x-4">
          {!isConnected ? (
            <div className="flex flex-col items-end space-y-2">
              <Button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Wallet size={16} />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </Button>
              {!window.ethereum && (
                <div className="flex items-center space-x-1 text-red-400 text-xs">
                  <AlertCircle size={12} />
                  <span>MetaMask not detected</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-400">
              <Wallet size={16} />
              <span className="text-sm">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/agent-dashboard')}
          >
            Agent Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/user-orders')}
            className="flex items-center space-x-2"
          >
            <History size={16} />
            <span>My Orders</span>
          </Button>
        </div>
      </div>

      {/* MetaMask Installation Notice */}
      {!window.ethereum && (
        <Card className="card-dark border-red-500/50 bg-red-500/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-400">
              <AlertCircle size={24} />
              <span>MetaMask Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              To use this app, you need to install MetaMask wallet extension.
            </p>
            <Button
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              className="gradient-button"
            >
              Install MetaMask
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User Location Input */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="text-primary" size={20} />
            <span>Delivery Location</span>
          </CardTitle>
          <CardDescription>
            Enter your delivery address where the order should be dropped
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g., 123 Main Street, Koramangala 5th Block, Bangalore"
            value={userLocation}
            onChange={(e) => setUserLocation(e.target.value)}
            className="input-dark"
          />
        </CardContent>
      </Card>

      {/* Agent Confirmation Status */}
      {agentConfirmation && (
        <Card className="card-dark border-green-500/50 bg-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-400">
              <CheckCircle size={24} />
              <span>Order Confirmed!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <User size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold">{agentConfirmation.agentName}</p>
                <p className="text-sm text-muted-foreground">Rating: {agentConfirmation.agentRating}/5</p>
                <p className="text-xs text-muted-foreground">Wallet: {agentConfirmation.agentWallet?.slice(0, 10)}...</p>
              </div>
            </div>
            <div className="bg-secondary/20 p-3 rounded-lg">
              <p className="text-sm mb-2">
                <strong>{agentConfirmation.agentName}</strong> has confirmed your order and is reaching to pickup location.
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Pickup in: {agentConfirmation.pickupTime}</span>
                <span>•</span>
                <span>ETA: {agentConfirmation.eta}</span>
              </div>
              <div className="mt-2 p-2 bg-secondary/30 rounded">
                <p className="text-xs text-muted-foreground">Drop Location:</p>
                <p className="text-sm font-medium">{userLocation}</p>
              </div>
              <div className="mt-2 p-2 bg-secondary/30 rounded">
                <p className="text-xs text-muted-foreground">Payment Amount:</p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.001"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-24 h-8"
                  />
                  <span className="text-sm font-medium">ETH</span>
                </div>
              </div>
            </div>
            <Button 
              className="w-full gradient-button"
              onClick={handlePayment}
              disabled={!isConnected || isLoading || !paymentAmount || parseFloat(paymentAmount) <= 0}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                `Pay ${paymentAmount} ETH to ${agentConfirmation.agentName}`
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Prompt Interface */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="text-primary" size={24} />
            <span>What would you like to order?</span>
          </CardTitle>
          <CardDescription>
            Describe your order in natural language. For example: "Order one masala dosa from Anna Idli Restro for me"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your order here... e.g., 'I want 2 butter chicken with naan from Punjabi Dhaba'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] input-dark"
            disabled={isProcessing || orderPosted || !isConnected}
          />
          
          <Button
            onClick={handleSubmitPrompt}
            disabled={!prompt.trim() || !userLocation.trim() || isProcessing || orderPosted || !isConnected}
            className="gradient-button w-full"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>AI is processing your order...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send size={16} />
                <span>{!isConnected ? 'Connect Wallet First' : 'Process Order'}</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Extracted Information */}
      {extractedInfo && !orderPosted && (
        <Card className="card-dark border-primary/50">
          <CardHeader>
            <CardTitle className="text-primary">Order Details Extracted</CardTitle>
            <CardDescription>
              Please verify the details before posting your order for delivery agents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Restaurant</p>
                <p className="font-medium">{extractedInfo.restaurant}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dish</p>
                <p className="font-medium">{extractedInfo.dish}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{extractedInfo.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Price</p>
                <p className="font-medium text-primary">{extractedInfo.estimatedPrice}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin size={16} />
              <span>{extractedInfo.deliveryLocation}</span>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={confirmAndPostOrder}
                className="gradient-button flex-1"
              >
                Post Order for Delivery Agents
              </Button>
              <Button
                variant="outline"
                onClick={() => setExtractedInfo(null)}
                className="flex-1"
              >
                Edit Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Posted Confirmation */}
      {orderPosted && !agentConfirmation && (
        <Card className="card-dark border-accent/50">
          <CardHeader>
            <CardTitle className="text-accent">Order Posted Successfully!</CardTitle>
            <CardDescription>
              Your order is now visible to delivery agents. Waiting for confirmations...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <span>Delivery agents can now see your order</span>
            </div>
            <div className="p-3 bg-secondary/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Order Details:</p>
              <p className="text-sm">{extractedInfo?.dish} from {extractedInfo?.restaurant}</p>
              <p className="text-sm text-muted-foreground">Drop: {extractedInfo?.deliveryLocation}</p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              To see agent confirmations, go to the Agent Dashboard or wait for updates here
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your order history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border"
            >
              <div className="flex-1">
                <p className="font-medium">{order.prompt}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Delivered' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-accent/20 text-accent'
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-sm text-muted-foreground">{order.time}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{order.amount}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
