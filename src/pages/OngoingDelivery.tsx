
import { useState } from 'react';
import { ArrowLeft, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';

const OngoingDelivery = () => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState('In Transit');

  const deliveryData = {
    startTime: '2:30 PM',
    pickup: 'Koramangala 5th Block',
    pickupAddress: '100 Feet Road, Near Forum Mall',
    drop: 'Indiranagar Metro Station',
    dropAddress: 'CMH Road, Indiranagar',
    eta: '3:15 PM',
    customerWallet: '0x1234...5678',
    customerPhone: '+91 98765 43210',
    payment: 110,
  };

  const statusSteps = [
    { label: 'Picked Up', completed: true },
    { label: 'In Transit', completed: false, current: true },
    { label: 'Delivered', completed: false },
  ];

  const handleMarkDelivered = () => {
    navigate('/delivery-completed');
  };

  const handleCallCustomer = () => {
    window.location.href = `tel:${deliveryData.customerPhone}`;
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-card hover:bg-card/80 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Ongoing Delivery</h1>
              <p className="text-muted-foreground">Job started at {deliveryData.startTime}</p>
            </div>
          </div>
          <div className="bg-primary/20 px-3 py-1 rounded-lg">
            <span className="text-primary font-medium text-sm">Active</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {statusSteps.map((step, index) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-primary text-black' 
                  : step.current 
                    ? 'bg-accent text-black' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {step.completed ? <CheckCircle size={16} /> : index + 1}
              </div>
              <div className="ml-2 flex-1">
                <p className={`text-sm font-medium ${
                  step.completed || step.current ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
              </div>
              {index < statusSteps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  step.completed ? 'bg-primary' : 'bg-border'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="card-dark bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-center text-lg font-semibold text-foreground mb-2">Live Tracking</h3>
          <p className="text-center text-muted-foreground">Delivery progress is being tracked</p>
        </div>

        <div className="card-dark space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-primary font-medium">✓ Picked</p>
              <p className="font-semibold text-foreground">{deliveryData.pickup}</p>
              <p className="text-sm text-muted-foreground">{deliveryData.pickupAddress}</p>
            </div>
          </div>

          <div className="ml-1.5 w-0.5 h-8 bg-border"></div>

          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-accent rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Drop Location</p>
              <p className="font-semibold text-foreground">{deliveryData.drop}</p>
              <p className="text-sm text-muted-foreground">{deliveryData.dropAddress}</p>
              <p className="text-sm text-accent mt-1">ETA {deliveryData.eta}</p>
            </div>
          </div>
        </div>

        <div className="card-dark space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Customer Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Wallet</span>
              <span className="font-medium">{deliveryData.customerWallet}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-accent">{deliveryData.customerPhone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-medium text-primary">₹{deliveryData.payment}</span>
            </div>
          </div>

          <button
            onClick={handleCallCustomer}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-accent/20 text-accent rounded-lg font-medium hover:bg-accent/30 transition-colors"
          >
            <Phone size={20} />
            <span>Call Customer</span>
          </button>
        </div>

        <button
          onClick={handleMarkDelivered}
          className="w-full gradient-button"
        >
          Mark as Delivered
        </button>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default OngoingDelivery;
