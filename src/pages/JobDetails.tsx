
import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, User, Star, MessageCircle } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate, useParams } from 'react-router-dom';

const JobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [message, setMessage] = useState('');

  const jobData = {
    budget: 120,
    timeAgo: '5 minutes ago',
    pickup: 'Koramangala 5th Block',
    pickupAddress: '100 Feet Road, Near Forum Mall, Koramangala 5th Block, Bengaluru',
    drop: 'Indiranagar Metro Station',
    dropAddress: 'Indiranagar Metro Station, CMH Road, Indiranagar, Bengaluru',
    distance: '4.2 km',
    dueTime: 'Today, 6:00 PM',
    customer: '0x1234...5678',
    specialInstructions: 'Handle with care - contains electronics',
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Bid submitted:', { bidAmount, estimatedTime, message });
    navigate('/bid-submitted');
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Job Details</h1>
            <div className="flex items-center space-x-2">
              <div className="bg-primary/20 px-2 py-1 rounded">
                <span className="text-primary font-bold text-sm">₹{jobData.budget}</span>
              </div>
              <span className="text-sm text-muted-foreground">{jobData.timeAgo}</span>
            </div>
          </div>
        </div>

        <div className="card-dark space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Route Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup Location</p>
                <p className="font-semibold text-foreground">{jobData.pickup}</p>
                <p className="text-sm text-muted-foreground mt-1">{jobData.pickupAddress}</p>
              </div>
            </div>

            <div className="ml-1.5 w-0.5 h-8 bg-border"></div>

            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-accent rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Drop Location</p>
                <p className="font-semibold text-foreground">{jobData.drop}</p>
                <p className="text-sm text-muted-foreground mt-1">{jobData.dropAddress}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin size={16} />
              <span className="text-sm">{jobData.distance}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock size={16} />
              <span className="text-sm">Due: {jobData.dueTime}</span>
            </div>
          </div>
        </div>

        <div className="card-dark space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{jobData.customer}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Delivery Deadline</span>
              <span className="font-medium">{jobData.dueTime}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Special Instructions</p>
            <p className="text-foreground">{jobData.specialInstructions}</p>
          </div>
        </div>

        <div className="card-dark space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Submit Your Bid</h3>
          
          <form onSubmit={handleSubmitBid} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Bid Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="input-dark pl-8 w-full"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Customer budget: ₹{jobData.budget}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Estimated Delivery Time</label>
              <input
                type="text"
                placeholder="e.g., 30 minutes"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="input-dark w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Message to Customer (Optional)</label>
              <textarea
                placeholder="Any additional information..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-dark w-full h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full gradient-button"
            >
              Submit Bid
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Customer will be notified of your bid
          </p>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default JobDetails;
