
import { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, User, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';

interface DeliveryJob {
  id: string;
  customerPrompt: string;
  restaurant: string;
  dish: string;
  quantity: number;
  estimatedPay: number;
  pickupLocation: string;
  dropLocation: string;
  distance: string;
  timePosted: string;
  urgency: string;
  customerRating: number;
  userName: string;
  userId: string;
  status: 'available' | 'confirmed' | 'completed';
}

const AgentDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('All Jobs');
  const [availableJobs, setAvailableJobs] = useState<DeliveryJob[]>([]);
  const [confirmedJobs, setConfirmedJobs] = useState<DeliveryJob[]>([]);
  const [agentName, setAgentName] = useState('');
  const navigate = useNavigate();

  const filters = ['All Jobs', 'Available', 'My Jobs', 'Completed'];

  // Load jobs from localStorage and listen for new ones
  useEffect(() => {
    const loadJobs = () => {
      const storedJobs = localStorage.getItem('deliveryJobs');
      if (storedJobs) {
        const jobs = JSON.parse(storedJobs);
        setAvailableJobs(jobs.filter((job: DeliveryJob) => job.status === 'available'));
      }
    };

    // Load initial jobs
    loadJobs();

    // Set up interval to check for new jobs
    const interval = setInterval(loadJobs, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmJob = (jobId: string) => {
    if (!agentName.trim()) {
      alert('Please enter your name first!');
      return;
    }

    const job = availableJobs.find(j => j.id === jobId);
    if (!job) return;

    // Move job from available to confirmed
    const confirmedJob = { ...job, status: 'confirmed' as const };
    setConfirmedJobs(prev => [...prev, confirmedJob]);
    setAvailableJobs(prev => prev.filter(j => j.id !== jobId));

    // Update localStorage
    const allJobs = localStorage.getItem('deliveryJobs');
    if (allJobs) {
      const jobs = JSON.parse(allJobs);
      const updatedJobs = jobs.map((j: DeliveryJob) => 
        j.id === jobId ? { ...j, status: 'confirmed' } : j
      );
      localStorage.setItem('deliveryJobs', JSON.stringify(updatedJobs));
    }

    // Store agent confirmation for user to see
    const confirmation = {
      agentName: agentName,
      agentRating: 4.8,
      eta: "35 minutes",
      pickupTime: "5 minutes"
    };
    
    localStorage.setItem('agentConfirmations', JSON.stringify([confirmation]));

    console.log('Job confirmed by:', agentName, confirmedJob);
  };

  const getFilteredJobs = () => {
    switch (activeFilter) {
      case 'Available':
        return availableJobs.filter(job => job.status === 'available');
      case 'My Jobs':
        return confirmedJobs;
      case 'Completed':
        return confirmedJobs.filter(job => job.status === 'completed');
      default:
        return [...availableJobs, ...confirmedJobs];
    }
  };

  const JobCard = ({ job }: { job: DeliveryJob }) => (
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
          <span>Customer: {job.userName}</span>
          <span>•</span>
          <span>Rating: {job.customerRating}/5</span>
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
          
          {job.status === 'available' ? (
            <Button 
              onClick={() => handleConfirmJob(job.id)}
              className="gradient-button"
            >
              Confirm Job
            </Button>
          ) : (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Confirmed by {agentName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delivery Jobs</h1>
          <p className="text-muted-foreground">Browse and confirm delivery jobs from customers</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/user-dashboard')}
          >
            Back to User Dashboard
          </Button>
          <div className="flex items-center space-x-2 text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{getFilteredJobs().length} Available Jobs</span>
          </div>
        </div>
      </div>

      {/* Agent Name Input */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>Enter your name to confirm orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter your name (e.g., Rajesh Kumar)"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="input-dark"
          />
        </CardContent>
      </Card>

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

      {/* Jobs List */}
      <div className="space-y-4">
        {getFilteredJobs().map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {getFilteredJobs().length === 0 && (
        <Card className="card-dark text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">No jobs found in this category</p>
            <p className="text-sm text-muted-foreground">
              {activeFilter === 'Available' ? 'Waiting for new delivery requests...' : 'You haven\'t confirmed any jobs yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentDashboard;
