
import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WalletConnection = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnecting(false);
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-black">A2A</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome to Agent-Agent</h1>
            <p className="text-muted-foreground">
              Connect your wallet to start earning with decentralized delivery jobs or post delivery requests.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 rounded-xl bg-card/50 border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm">💰</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Earn as an Agent</h3>
                <p className="text-sm text-muted-foreground">Bid on delivery jobs and earn crypto</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-xl bg-card/50 border border-border">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-sm">📦</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Post Delivery Jobs</h3>
                <p className="text-sm text-muted-foreground">Get your items delivered quickly</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-xl bg-card/50 border border-border">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-400 text-sm">🔐</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Decentralized & Secure</h3>
                <p className="text-sm text-muted-foreground">Blockchain-powered transparency</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="w-full gradient-button flex items-center justify-center space-x-2"
          >
            <Wallet size={20} />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>

          <p className="text-sm text-muted-foreground">
            Supports MetaMask, WalletConnect & more
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnection;
