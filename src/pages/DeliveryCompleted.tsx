
import { useState } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeliveryCompleted = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const deliveryData = {
    earnings: 110,
    from: 'Koramangala 5th Block',
    to: 'Indiranagar Metro Station',
    completedAt: '3:12 PM',
    duration: '42 minutes',
    customer: '0x1234...5678',
  };

  const handleSubmitRating = () => {
    console.log('Rating submitted:', { rating, feedback });
    navigate('/dashboard');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <CheckCircle size={40} className="text-black" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Delivery Completed!</h1>
            <p className="text-muted-foreground">Great job! Your payment has been processed.</p>
          </div>
        </div>

        <div className="card-dark bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">You Earned</h3>
          <p className="text-4xl font-bold text-primary mb-2">₹{deliveryData.earnings}</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm text-primary font-medium">Funds Released</span>
          </div>
        </div>

        <div className="card-dark space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Delivery Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">From</span>
              <span className="font-medium text-foreground">{deliveryData.from}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To</span>
              <span className="font-medium text-foreground">{deliveryData.to}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed At</span>
              <span className="font-medium text-foreground">{deliveryData.completedAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium text-foreground">{deliveryData.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-foreground">{deliveryData.customer}</span>
            </div>
          </div>
        </div>

        <div className="card-dark space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Rate Your Customer</h3>
          <p className="text-sm text-muted-foreground">Help other agents by rating this customer</p>
          
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-colors"
              >
                <Star
                  size={32}
                  className={star <= rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground hover:text-yellow-400'}
                />
              </button>
            ))}
          </div>

          <textarea
            placeholder="Share your experience (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="input-dark w-full h-20 resize-none"
          />
        </div>

        <button
          onClick={handleSubmitRating}
          className="w-full gradient-button"
        >
          Submit Rating
        </button>

        <button
          onClick={handleSkip}
          className="w-full py-3 bg-card text-foreground rounded-lg font-medium hover:bg-card/80 transition-colors"
        >
          Skip for Now
        </button>

        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-3 bg-muted/20 text-foreground rounded-lg font-medium hover:bg-muted/30 transition-colors"
          >
            Find More Jobs
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex-1 py-3 bg-muted/20 text-foreground rounded-lg font-medium hover:bg-muted/30 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryCompleted;
