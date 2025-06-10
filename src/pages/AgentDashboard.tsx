import { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, User, CheckCircle, Wallet, Bell, Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useICPWeb3 } from '../contexts/ICPWeb3Context';
import { useToast } from '../hooks/use-toast';
import AIDeliveryEstimator from '../components/AIDeliveryEstimator';
import DemoModeIndicator from '../components/DemoModeIndicator';

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
  const [selectedJob, setSelectedJob] = useState<DeliveryJob | null>(null);
  
  const navigate = useNavigate();
  const { isConnected, walletAddress, connectWallet, registerAgent, confirmOrder, isLoading } = useICPWeb3();
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
        title: "ICP wallet not connected",
        description: "Please connect your Internet Identity first",
        variant: "destructive"
      });
      return;
    }

    try {
      const txHash = await registerAgent(agentName);
      toast({
        title: "✅ Agent registered successfully!",
        description: `Transaction: ${txHash.slice(0, 10)}... on ICP blockchain`,
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
      toast({
        title: "Please enter your name first!",
        variant: "destructive"
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "ICP wallet not connected",
        description: "Please connect your Internet Identity first",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔄 Confirming job:', jobId, 'by agent:', agentName);
      
      // Confirm on ICP blockchain
      const txHash = await confirmOrder(jobId);
      
      const job = availableJobs.find(j => j.id === jobId);
      if (!job) return;

      // Move job from available to confirmed
      const confirmedJob = { ...job, status: 'confirmed' as const, agentName: agentName, agentWallet: walletAddress };
      setConfirmedJobs(prev => [...prev, confirmedJob]);
      setAvailableJobs(prev => prev.filter(j => j.id !== jobId));

      // Update localStorage
      const allJobs = localStorage.getItem('deliveryJobs');
      if (allJobs) {
        const jobs = JSON.parse(allJobs);
        const updatedJobs = jobs.map((j: any) => 
          j.id === jobId ? { ...j, status: 'confirmed', agentName: agentName, agentWallet: walletAddress, confirmedAt: new Date().toISOString() } : j
        );
        localStorage.setItem('deliveryJobs', JSON.stringify(updatedJobs));
      }

      // Store agent confirmation for user to see (with agent's wallet address)
      const confirmation = {
        orderId: jobId,
        agentName: agentName,
        agentWallet: walletAddress, // Important: this is the agent's wallet address for payment
        agentRating: 4.8,
        eta: "35 minutes",
        pickupTime: "5 minutes",
        confirmedAt: new Date().toISOString()
      };
      
      localStorage.setItem('agentConfirmations', JSON.stringify([confirmation]));

      toast({
        title: "🎉 Job confirmed successfully!",
        description: `Transaction: ${txHash.slice(0, 10)}... | Customer can now pay you on ICP!`,
      });

      console.log('✅ Job confirmed by:', agentName, 'Order ID:', jobId, 'Agent wallet:', walletAddress);
    } catch (error) {
      console.error('❌ Failed to confirm job:', error);
      toast({
        title: "Failed to confirm job",
        description: error instanceof Error ? error.message : "Please try again",
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
              <span>🎉 DEMO Payment Received!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-secondary/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg text-green-400">{payment.amount} ICP</h4>
                <span className="text-sm text-muted-foreground">
                  {new Date(payment.timestamp).toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm mb-3">
                <strong>{payment.customerName}</strong> sent you <strong>{payment.amount} ICP</strong> for Order #{payment.orderId}
              </p>

              {payment.orderDetails && (
                <div className="mb-3 p-2 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground">Order Details:</p>
                  <p className="text-sm">{payment.orderDetails.dish} from {payment.orderDetails.restaurant}</p>
                  <p className="text-xs text-muted-foreground">Delivered to: {payment.orderDetails.location}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Transaction Hash</p>
                  <p className="font-mono text-xs">{payment.txHash?.slice(0, 20)}...</p>
                </div>
                <div>
                  <p className="text-muted-foreground">From Principal</p>
                  <p className="font-mono text-xs">{payment.customerWallet?.slice(0, 15)}...</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Block Height</p>
                  <p className="font-mono text-xs">{payment.blockchainData?.blockHeight}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Confirmations</p>
                  <p className="font-mono text-xs">{payment.blockchainData?.confirmations}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-500/20 text-green-400 border border-green-500/30">
                <Play size={16} className="mr-2" />
                ✓ Demo Payment Confirmed on ICP Blockchain
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
      {paymentNotifications.length === 0 && (
        <Card className="card-dark text-center py-12">
          <CardContent>
            <DollarSign size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payments received yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              🎭 Demo payments will appear here after customers complete their orders
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const JobCard = ({ job }: { job: DeliveryJob }) => (
    <Card 
      key={job.id} 
      className={`card-dark hover:bg-card/90 transition-all duration-200 cursor-pointer ${
        selectedJob?.id === job.id ? 'border-blue-500/50 bg-blue-500/10' : ''
      }`}
      onClick={() => setSelectedJob(job)}
    >
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
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmJob(job.id);
              }}
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
      {/* Demo Mode Indicator */}
      <DemoModeIndicator />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delivery Jobs</h1>
          <p className="text-muted-foreground">Browse and confirm delivery jobs from customers on ICP</p>
        </div>
        <div className="flex items-center space-x-4">
          {!isConnected ? (
            <Button
              onClick={connectWallet}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Wallet size={16} />
              <span>{isLoading ? 'Connecting...' : 'Connect Internet Identity'}</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2 text-green-400">
              <Wallet size={16} />
              <span className="text-sm">{walletAddress?.slice(0, 10)}...{walletAddress?.slice(-4)}</span>
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
              <span className="text-sm font-medium">{paymentNotifications.length} Demo Payments</span>
            </div>
          )}
        </div>
      </div>

      {/* Agent Registration */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>Register as an agent on the ICP blockchain</CardDescription>
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
            {isLoading ? 'Registering...' : 'Register on ICP Blockchain'}
          </Button>
        </CardContent>
      </Card>

      {/* AI Delivery Estimator */}
      {selectedJob && (
        <AIDeliveryEstimator
          pickupLocation={selectedJob.pickupLocation}
          dropLocation={selectedJob.dropLocation}
          distance={selectedJob.distance}
        />
      )}

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
            {filter === 'Payments' && paymentNotifications.length > 0 && (
              <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {paymentNotifications.length}
              </span>
            )}
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

      {getFilteredJobs().length === 0 && activeFilter !== 'Payments' && (
        <Card className="card-dark text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">No jobs found in this category</p>
            <p className="text-sm text-muted-foreground">
              {activeFilter === 'Available' ? 'Waiting for new delivery requests on ICP...' : 'You haven\'t confirmed any jobs yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentDashboard;