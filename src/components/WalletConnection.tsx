
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wallet, User, Truck } from 'lucide-react';
import { useICPWeb3 } from '../contexts/ICPWeb3Context';
import { useToast } from '../hooks/use-toast';

const WalletConnection = () => {
  const [selectedRole, setSelectedRole] = useState<'user' | 'agent' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  const { connectWallet, isLoading, error } = useICPWeb3();
  const { toast } = useToast();

  const handleConnectWallet = async () => {
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select your role first",
        variant: "destructive"
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      console.log('Starting Internet Identity connection...');
      await connectWallet();
      
      toast({
        title: "Connected Successfully!",
        description: "Internet Identity connected successfully",
      });
      
      // Navigate based on selected role
      if (selectedRole === 'user') {
        navigate('/user-dashboard');
      } else {
        navigate('/agent-dashboard');
      }
    } catch (error: any) {
      console.error('Internet Identity connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect with Internet Identity",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DeliverDAO
          </h1>
          <p className="text-muted-foreground">
            Decentralized delivery platform on Internet Computer
          </p>
        </div>

        <Card className="card-dark">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Wallet size={24} />
              <span>Choose Your Role</span>
            </CardTitle>
            <CardDescription>
              Connect with Internet Identity to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setSelectedRole('user')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedRole === 'user'
                    ? 'border-primary bg-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <User size={24} className="text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">Order Food</h3>
                    <p className="text-sm text-muted-foreground">
                      Place orders using AI prompts
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole('agent')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedRole === 'agent'
                    ? 'border-primary bg-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Truck size={24} className="text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">Deliver Orders</h3>
                    <p className="text-sm text-muted-foreground">
                      Accept delivery jobs and earn
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <Button
              onClick={handleConnectWallet}
              disabled={!selectedRole || isConnecting || isLoading}
              className="w-full gradient-button"
            >
              {isConnecting || isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to Internet Identity...</span>
                </div>
              ) : (
                'Connect with Internet Identity'
              )}
            </Button>
            
            {error && (
              <div className="text-center p-3 bg-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Powered by Internet Computer Protocol
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletConnection;
