
import { useState, useEffect } from 'react';
import { Send, MapPin, Clock, Bot, History, User, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedOrderInfo | null>(null);
  const [orderPosted, setOrderPosted] = useState(false);
  const [agentConfirmation, setAgentConfirmation] = useState<AgentConfirmation | null>(null);
  const navigate = useNavigate();

  // Simulate real-time listening for agent confirmations
  useEffect(() => {
    if (orderPosted) {
      // Simulate agent confirmation after 10 seconds
      const timer = setTimeout(() => {
        setAgentConfirmation({
          agentName: "Rajesh Kumar",
          agentRating: 4.8,
          eta: "35 minutes",
          pickupTime: "5 minutes"
        });
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [orderPosted]);

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

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing and information extraction
    setTimeout(() => {
      const mockExtraction: ExtractedOrderInfo = {
        restaurant: "Anna Idli Restro",
        dish: "Masala Dosa",
        quantity: 1,
        estimatedPrice: "₹120",
        deliveryLocation: "Current Location (Koramangala 5th Block)",
        urgency: "Normal",
        userName: "John Doe",
        userId: "user_123",
        orderId: `order_${Date.now()}`
      };
      
      setExtractedInfo(mockExtraction);
      setIsProcessing(false);
    }, 3000);
  };

  const confirmAndPostOrder = () => {
    if (!extractedInfo) return;
    
    // Here you would post the order to your backend/smart contract
    console.log('Posting order to blockchain/backend:', extractedInfo);
    
    // Simulate posting to delivery agents
    setOrderPosted(true);
    
    // Clear the form
    setPrompt('');
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Food Assistant</h1>
          <p className="text-muted-foreground">Just tell me what you want to order!</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/user-orders')}
          className="flex items-center space-x-2"
        >
          <History size={16} />
          <span>My Orders</span>
        </Button>
      </div>

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
            </div>
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
            placeholder="Type your order here... e.g., 'I want 2 butter chicken with naan from Punjabi Dhaba, deliver to my office'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] input-dark"
            disabled={isProcessing || orderPosted}
          />
          
          <Button
            onClick={handleSubmitPrompt}
            disabled={!prompt.trim() || isProcessing || orderPosted}
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
