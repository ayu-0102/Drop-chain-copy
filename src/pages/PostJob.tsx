
import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, FileText } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    budget: '',
    date: '',
    time: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle job submission
    console.log('Job posted:', formData);
    navigate('/dashboard');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Post Delivery Job</h1>
            <p className="text-muted-foreground">Create a new delivery request and let agents bid</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
                <input
                  type="text"
                  placeholder="Enter pickup address"
                  value={formData.pickupLocation}
                  onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                  className="input-dark pl-12 w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Drop Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" size={20} />
                <input
                  type="text"
                  placeholder="Enter delivery address"
                  value={formData.dropLocation}
                  onChange={(e) => handleInputChange('dropLocation', e.target.value)}
                  className="input-dark pl-12 w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Budget (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="input-dark pl-8 w-full"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Minimum budget: ₹50</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="input-dark pl-12 w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="input-dark pl-12 w-full"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Additional Notes (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <textarea
                  placeholder="Special instructions, item details, etc."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="input-dark pl-12 w-full h-24 resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full gradient-button"
          >
            Submit Job
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Job will be visible to agents immediately
          </p>
        </form>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default PostJob;
