
import { useState } from 'react';
import { MapPin, Clock, DollarSign, Filter } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('All Jobs');
  const navigate = useNavigate();

  const filters = ['All Jobs', 'Nearby', 'High Budget', 'Quick'];
  const activeJobsCount = 4;

  const jobs = [
    {
      id: 1,
      budget: 120,
      timeAgo: '5 minutes ago',
      pickup: 'Koramangala 5th Block',
      drop: 'Indiranagar Metro Station',
      distance: '4.2 km',
      eta: '30 mins',
    },
    {
      id: 2,
      budget: 280,
      timeAgo: '12 minutes ago',
      pickup: 'Brigade Road',
      drop: 'Electronic City Phase 1',
      distance: '18.5 km',
      eta: '45 mins',
    },
    {
      id: 3,
      budget: 200,
      timeAgo: '18 minutes ago',
      pickup: 'Whitefield Main Road',
      drop: 'HSR Layout Sector 2',
      distance: '12.8 km',
      eta: '35 mins',
    },
    {
      id: 4,
      budget: 150,
      timeAgo: '22 minutes ago',
      pickup: 'MG Road Metro',
      drop: 'Jayanagar 4th Block',
      distance: '8.1 km',
      eta: '25 mins',
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Available Jobs</h1>
            <p className="text-muted-foreground">Browse and bid on delivery jobs near you</p>
          </div>
          <div className="flex items-center space-x-2 text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-slow"></div>
            <span className="text-sm font-medium">{activeJobsCount} Active</span>
          </div>
        </div>

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

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="card-dark hover:bg-card/90 transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/job/${job.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary/20 px-3 py-1 rounded-lg">
                  <span className="text-primary font-bold">₹{job.budget}</span>
                </div>
                <span className="text-sm text-muted-foreground">{job.timeAgo}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup</p>
                    <p className="font-medium text-foreground">{job.pickup}</p>
                  </div>
                </div>

                <div className="ml-1.5 w-0.5 h-6 bg-border"></div>

                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Drop</p>
                    <p className="font-medium text-foreground">{job.drop}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin size={16} />
                    <span className="text-sm">{job.distance}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Clock size={16} />
                    <span className="text-sm">ETA {job.eta}</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
