
import { useState } from 'react';
import { Send, MapPin, Clock, Bot, History } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<any>(null);
  const navigate = useNavigate();

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
    
    // Simulate AI processing
    setTimeout(() => {
      const mockExtraction = {
        restaurant: "Anna Idli Restro",
        dish: "Masala Dosa",
        quantity: 1,
        estimatedPrice: "₹120",
        deliveryLocation: "Current Location",
        urgency: "Normal"
      };
      
      setExtractedInfo(mockExtraction);
      setIsProcessing(false);
    }, 3000);
  };

  const confirmOrder = () => {
    // Here you would create the job and navigate to job tracking
    navigate('/user-orders');
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
            disabled={isProcessing}
          />
          
          <Button
            onClick={handleSubmitPrompt}
            disabled={!prompt.trim() || isProcessing}
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
      {extractedInfo && (
        <Card className="card-dark border-primary/50">
          <CardHeader>
            <CardTitle className="text-primary">Order Details Extracted</CardTitle>
            <CardDescription>
              Please verify the details before confirming your order
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
                onClick={confirmOrder}
                className="gradient-button flex-1"
              >
                Confirm & Post Job
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
