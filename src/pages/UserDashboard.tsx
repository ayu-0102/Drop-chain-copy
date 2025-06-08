import { useState, useEffect } from 'react';
import { Send, MapPin, Clock, Bot, History, User, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

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
  agentName: string;
  agentRating: number;
  eta: string;
  pickupTime: string;
}

const UserDashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedOrderInfo | null>(null);
  const [orderPosted, setOrderPosted] = useState(false);
  const [agentConfirmation, setAgentConfirmation] = useState<AgentConfirmation | null>(null);
  const navigate = useNavigate();

  // Listen for agent confirmations from localStorage
  useEffect(() => {
    const checkForConfirmations = () => {
      const confirmations = localStorage.getItem('agentConfirmations');
      if (confirmations) {
        const parsed = JSON.parse(confirmations);
        if (parsed.length > 0) {
          setAgentConfirmation(parsed[0]);
          // Clear the confirmation after showing it
          localStorage.removeItem('agentConfirmations');
        }
      }
    };

    const interval = setInterval(checkForConfirmations, 1000);
    return () => clearInterval(interval);
  }, []);

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
      alert('Please enter your delivery location first!');
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

  const confirmAndPostOrder = () => {
    if (!extractedInfo) return;
    
    console.log('Posting order to delivery agents:', extractedInfo);
    
    // Store the order in localStorage for delivery agents to see
    const existingOrders = localStorage.getItem('deliveryJobs');
    const orders = existingOrders ? JSON.parse(existingOrders) : [];
    
    const newJob = {
      id: extractedInfo.orderId,
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
      status: 'available'
    };
    
    orders.unshift(newJob);
    localStorage.setItem('deliveryJobs', JSON.stringify(orders));
    
    setOrderPosted(true);
    setPrompt('');
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Food Assistant</h1>
          <p className="text-muted-foreground">Just tell me what you want to order!</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/agent-dashboard')}
          >
            Switch to Agent Dashboard
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
              </div>
            </div>
            <div className="bg-secondary/20 p-3 rounded-lg">
              <p className="text-sm mb-2">
                <strong>{agentConfirmation.agentName}</strong> has confirmed your order and is reaching to <strong>{extractedInfo?.restaurant}</strong> for pickup.
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
            </div>
            <Button className="w-full gradient-button">
              Pay Now (ETH/Tokens)
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
            disabled={isProcessing || orderPosted}
          />
          
          <Button
            onClick={handleSubmitPrompt}
            disabled={!prompt.trim() || !userLocation.trim() || isProcessing || orderPosted}
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
                <span>Process Order</span>
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
