
import { useState, useEffect } from 'react';
import { Clock, MapPin, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DeliveryEstimate {
  estimatedTime: string;
  trafficCondition: string;
  bestRoute: string;
  confidence: number;
}

interface AIDeliveryEstimatorProps {
  pickupLocation: string;
  dropLocation: string;
  distance: string;
}

const AIDeliveryEstimator = ({ pickupLocation, dropLocation, distance }: AIDeliveryEstimatorProps) => {
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (pickupLocation && dropLocation) {
      calculateDeliveryEstimate();
    }
  }, [pickupLocation, dropLocation, distance]);

  const calculateDeliveryEstimate = async () => {
    setIsCalculating(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI calculation based on distance and current time
    const currentHour = new Date().getHours();
    const baseTime = parseFloat(distance.replace(' km', '')) * 3; // 3 minutes per km base
    
    // Add traffic factors based on time of day
    let trafficMultiplier = 1;
    let trafficCondition = 'Light';
    
    if (currentHour >= 8 && currentHour <= 10) {
      trafficMultiplier = 1.5;
      trafficCondition = 'Heavy (Morning Rush)';
    } else if (currentHour >= 18 && currentHour <= 20) {
      trafficMultiplier = 1.4;
      trafficCondition = 'Heavy (Evening Rush)';
    } else if (currentHour >= 12 && currentHour <= 14) {
      trafficMultiplier = 1.2;
      trafficCondition = 'Moderate (Lunch Time)';
    }
    
    const estimatedMinutes = Math.round(baseTime * trafficMultiplier);
    
    // Generate route suggestion
    const routes = [
      'Via Koramangala Main Road',
      'Via Intermediate Ring Road',
      'Via HSR Layout Main Road',
      'Via Sarjapur Road'
    ];
    
    const bestRoute = routes[Math.floor(Math.random() * routes.length)];
    
    setEstimate({
      estimatedTime: `${estimatedMinutes} minutes`,
      trafficCondition,
      bestRoute,
      confidence: Math.floor(85 + Math.random() * 10) // 85-95% confidence
    });
    
    setIsCalculating(false);
  };

  return (
    <Card className="card-dark border-blue-500/50 bg-blue-500/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-400">
          <Brain size={20} />
          <span>AI Delivery Estimator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isCalculating ? (
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">AI is analyzing route and traffic conditions...</span>
          </div>
        ) : estimate ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/20 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock size={16} className="text-blue-400" />
                  <span className="text-xs text-muted-foreground">Estimated Time</span>
                </div>
                <p className="font-semibold text-blue-400">{estimate.estimatedTime}</p>
              </div>
              
              <div className="bg-secondary/20 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin size={16} className="text-blue-400" />
                  <span className="text-xs text-muted-foreground">Traffic</span>
                </div>
                <p className="font-semibold text-sm">{estimate.trafficCondition}</p>
              </div>
            </div>
            
            <div className="bg-secondary/20 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">AI Recommended Route</p>
              <p className="font-medium text-sm">{estimate.bestRoute}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Distance: {distance}</span>
                <span className="text-xs text-green-400">Confidence: {estimate.confidence}%</span>
              </div>
            </div>
            
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                ✨ AI-Powered Prediction
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Select a job to see AI delivery estimates
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AIDeliveryEstimator;
