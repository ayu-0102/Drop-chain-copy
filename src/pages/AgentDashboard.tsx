import { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, User, CheckCircle, Wallet, Bell } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useToast } from '../hooks/use-toast';

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
  const [paymentNotifications, setPaymentNotifications] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const { isConnected, walletAddress, connectWallet, registerAgent, confirmOrder, isLoading } = useWeb3();
  const { toast } = useToast();

  const filters = ['All Jobs', 'Available', 'My Jobs', 'Completed', 'Payments'];

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

  // Listen for payment notifications
  useEffect(() => {
    const checkForPayments = () => {
      const payments = localStorage.getItem('agentPayments');
      if (payments) {
        const parsed = JSON.parse(payments);
        setPaymentNotifications(parsed);
      }
    };

    checkForPayments();
    const interval = setInterval(checkForPayments, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterAgent = async () => {
    if (!agentName.trim()) {
      toast({
        title: "Please enter your name",
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

    try {
      const txHash = await registerAgent(agentName);
      toast({
        title: "Agent registered successfully!",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
    } catch (error) {
      console.error('Failed to register agent:', error);
      toast({
        title: "Registration failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleConfirmJob = async (jobId: string) => {
    if (!agentName.trim()) {
      alert('Please enter your name first!');
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

    try {
      // Confirm on blockchain
      const txHash = await confirmOrder(jobId);
      
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

      toast({
        title: "Job confirmed successfully!",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });

      console.log('Job confirmed by:', agentName, confirmedJob);
    } catch (error) {
      console.error('Failed to confirm job:', error);
      toast({
        title: "Failed to confirm job",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const getFilteredJobs = () => {
    switch (activeFilter) {
      case 'Available':
        return availableJobs.filter(job => job.status === 'available');
      case 'My Jobs':
        return confirmedJobs;
      case 'Completed':
        return confirmedJobs.filter(job => job.status === 'completed');
      case 'Payments':
        return [];
      default:
        return [...availableJobs, ...confirmedJobs];
    }
  };

  const PaymentNotifications = () => (
    <div className="space-y-4">
      {paymentNotifications.map((payment, index) => (
        <Card key={index} className="card-dark border-green-500/50 bg-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-400">
              <DollarSign size={24} />
              <span>Payment Received!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-secondary/20 p-3 rounded-lg">
              <p className="text-sm mb-2">
                <strong>{payment.customerName}</strong> sent you <strong>{payment.amount} ETH</strong>
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Order ID: {payment.orderId}</span>
                <span>•</span>
                <span>{new Date(payment.timestamp).toLocaleString()}</span>
              </div>
              <div className="mt-2 p-2 bg-secondary/30 rounded text-xs">
                <p>Transaction: {payment.txHash?.slice(0, 20)}...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {paymentNotifications.length === 0 && (
        <Card className="card-dark text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No payments received yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

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
          {!isConnected ? (
            <Button
              onClick={connectWallet}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Wallet size={16} />
              <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2 text-green-400">
              <Wallet size={16} />
              <span className="text-sm">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/user-dashboard')}
          >
            User Dashboard
          </Button>
          <div className="flex items-center space-x-2 text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{getFilteredJobs().length} Available Jobs</span>
          </div>
          {paymentNotifications.length > 0 && (
            <div className="flex items-center space-x-2 text-green-400">
              <Bell size={16} />
              <span className="text-sm font-medium">{paymentNotifications.length} Payments</span>
            </div>
          )}
        </div>
      </div>

      {/* Agent Registration */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>Register as an agent on the blockchain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Enter your name (e.g., Rajesh Kumar)"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="input-dark"
          />
          <Button
            onClick={handleRegisterAgent}
            disabled={!isConnected || !agentName.trim() || isLoading}
            className="gradient-button"
          >
            {isLoading ? 'Registering...' : 'Register on Blockchain'}
          </Button>
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

      {/* Jobs List or Payment Notifications */}
      <div className="space-y-4">
        {activeFilter === 'Payments' ? (
          <PaymentNotifications />
        ) : (
          getFilteredJobs().map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        )}
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
