import { useState } from 'react';
import { Play, Square, RotateCcw, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { icpWeb3Service } from '../utils/icpWeb3';
import { demoPaymentService } from '../utils/demoPaymentService';
import { useToast } from '../hooks/use-toast';

const DemoModeIndicator = () => {
  const [isDemoMode, setIsDemoMode] = useState(icpWeb3Service.isDemoModeEnabled());
  const { toast } = useToast();

  const toggleDemoMode = () => {
    if (isDemoMode) {
      icpWeb3Service.disableDemoMode();
      setIsDemoMode(false);
      toast({
        title: "Demo Mode Disabled",
        description: "Now using real ICP transactions",
        variant: "destructive"
      });
    } else {
      icpWeb3Service.enableDemoMode();
      setIsDemoMode(true);
      toast({
        title: "Demo Mode Enabled",
        description: "Perfect for showcasing to judges!",
      });
    }
  };

  const resetDemo = () => {
    icpWeb3Service.clearDemoData();
    toast({
      title: "Demo Reset",
      description: "All demo data has been cleared",
    });
  };

  if (!isDemoMode) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={toggleDemoMode}
          variant="outline"
          size="sm"
          className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
        >
          <Play size={16} className="mr-2" />
          Enable Demo Mode
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 bg-green-500/10 border-green-500/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-green-400 text-sm">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span>DEMO MODE ACTIVE</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Perfect for showcasing to judges! All transactions are simulated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-green-500/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Info size={16} className="text-green-400" />
              <span className="text-sm font-medium text-green-400">Demo Features</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Realistic ICP transaction simulation</li>
              <li>• Instant payment confirmations</li>
              <li>• Agent payment notifications</li>
              <li>• Blockchain-like transaction hashes</li>
              <li>• No real ICP tokens required</li>
            </ul>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={toggleDemoMode}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <Square size={14} className="mr-1" />
              Disable
            </Button>
            <Button
              onClick={resetDemo}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <RotateCcw size={14} className="mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoModeIndicator;