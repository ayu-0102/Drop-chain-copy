
import { useState } from 'react';
import { MapPin, Clock, DollarSign, User, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

const AgentDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('All Jobs');
  const navigate = useNavigate();

  const filters = ['All Jobs', 'Nearby', 'High Pay', 'Quick Delivery'];
  
  const availableJobs = [
    {
      id: 1,
      customerPrompt: "Order one masala dosa from Anna Idli Restro for me",
      restaurant: "Anna Idli Restro",
      dish: "Masala Dosa",
      quantity: 1,
      estimatedPay: 150,
      pickupLocation: "Anna Idli Restro, Koramangala",
      dropLocation: "Indiranagar Metro Station",
      distance: "4.2 km",
      timePosted: "5 minutes ago",
      urgency: "Normal",
      customerRating: 4.8
    },
    {
      id: 2,
      customerPrompt: "Get me 2 butter chicken with naan from Punjabi Dhaba",
      restaurant: "Punjabi Dhaba",
      dish: "Butter Chicken + Naan",
      quantity: 2,
      estimatedPay: 280,
      pickupLocation: "Punjabi Dhaba, Brigade Road",
      dropLocation: "Electronic City Phase 1",
      distance: "18.5 km",
      timePosted: "12 minutes ago",
      urgency: "High",
      customerRating: 4.9
    },
    {
      id: 3,
      customerPrompt: "Order veg biryani from Paradise Restaurant",
      restaurant: "Paradise Restaurant",
      dish: "Veg Biryani",
      quantity: 1,
      estimatedPay: 200,
      pickupLocation: "Paradise Restaurant, HSR Layout",
      dropLocation: "Jayanagar 4th Block",
      distance: "8.1 km",
      timePosted: "18 minutes ago",
      urgency: "Normal",
      customerRating: 4.7
    }
  ];

  const handleAcceptJob = (jobId: number) => {
    navigate(`/agent-job-details/${jobId}`);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Available Delivery Jobs</h1>
          <p className="text-muted-foreground">Browse and accept delivery jobs from customers</p>
        </div>
        <div className="flex items-center space-x-2 text-primary">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-slow"></div>
          <span className="text-sm font-medium">{availableJobs.length} Active Jobs</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-3 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
              activeFilter === filter
                ? 'bg-primary text-black font-medium'
                : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Available Jobs */}
      <div className="space-y-4">
        {availableJobs.map((job) => (
          <Card key={job.id} className="card-dark hover:bg-card/90 transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    {job.dish} from {job.restaurant}
                  </CardTitle>
                  <CardDescription className="italic">
                    "{job.customerPrompt}"
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="bg-primary/20 px-3 py-1 rounded-lg">
                    <span className="text-primary font-bold">₹{job.estimatedPay}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{job.timePosted}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="flex items-center space-x-2 text-sm">
                <User size={16} className="text-muted-foreground" />
                <span>Customer Rating: {job.customerRating}/5</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  job.urgency === 'High' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {job.urgency} Priority
                </span>
              </div>

              {/* Route Information */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup</p>
                    <p className="font-medium text-foreground">{job.pickupLocation}</p>
                  </div>
                </div>

                <div className="ml-1.5 w-0.5 h-6 bg-border"></div>

                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Drop</p>
                    <p className="font-medium text-foreground">{job.dropLocation}</p>
                  </div>
                </div>
              </div>

              {/* Job Details & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin size={16} />
                    <span className="text-sm">{job.distance}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <DollarSign size={16} />
                    <span className="text-sm">₹{Math.round(job.estimatedPay / parseFloat(job.distance))}/km</span>
                  </div>
                </div>
                <Button 
                  onClick={() => handleAcceptJob(job.id)}
                  className="gradient-button"
                >
                  Accept Job
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentDashboard;
