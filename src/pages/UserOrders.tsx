
import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, User, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

const UserOrders = () => {
  const [activeTab, setActiveTab] = useState('Active');
  const navigate = useNavigate();

  const tabs = ['Active', 'Completed', 'Cancelled'];

  const activeOrders = [
    {
      id: 1,
      dish: "Masala Dosa",
      restaurant: "Anna Idli Restro",
      status: "Agent Assigned",
      agentName: "Rajesh Kumar",
      agentRating: 4.8,
      estimatedTime: "25 mins",
      totalAmount: 150,
      orderTime: "10 minutes ago"
    }
  ];

  const completedOrders = [
    {
      id: 2,
      dish: "Butter Chicken + Naan",
      restaurant: "Punjabi Dhaba",
      status: "Delivered",
      agentName: "Priya Sharma",
      agentRating: 4.9,
      deliveredTime: "2 hours ago",
      totalAmount: 420,
      orderTime: "3 hours ago"
    }
  ];

  const getCurrentOrders = () => {
    switch (activeTab) {
      case 'Active': return activeOrders;
      case 'Completed': return completedOrders;
      default: return [];
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/user-dashboard')}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">Track your food delivery orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-secondary/20 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-primary text-black'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {getCurrentOrders().map((order) => (
          <Card key={order.id} className="card-dark">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{order.dish}</CardTitle>
                  <CardDescription>{order.restaurant}</CardDescription>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Delivered' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Agent Info */}
              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.agentName}</p>
                    <p className="text-sm text-muted-foreground">Rating: {order.agentRating}/5</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <MessageCircle size={16} />
                </Button>
              </div>

              {/* Order Details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Clock size={16} />
                    <span className="text-sm">
                      {order.status === 'Delivered' ? order.deliveredTime : `ETA ${order.estimatedTime}`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">₹{order.totalAmount}</p>
                  <p className="text-xs text-muted-foreground">{order.orderTime}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {order.status !== 'Delivered' && (
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    Track Order
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    Cancel Order
                  </Button>
                </div>
              )}

              {order.status === 'Delivered' && (
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    Rate Delivery
                  </Button>
                  <Button className="flex-1 gradient-button">
                    Reorder
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {getCurrentOrders().length === 0 && (
        <Card className="card-dark text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">No orders found in this category</p>
            <Button 
              onClick={() => navigate('/user-dashboard')}
              className="gradient-button"
            >
              Place Your First Order
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserOrders;
