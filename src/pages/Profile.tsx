
import { useState } from 'react';
import { Star, TrendingUp, Clock, MapPin, Settings, History } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  const profileData = {
    name: 'Rajesh Kumar',
    wallet: '0x1234...5678',
    memberSince: 'March 2024',
    rating: 4.8,
    totalJobs: 127,
    totalEarnings: 15420,
    successRate: 98,
    avgDeliveryTime: '28 mins',
    badges: ['Fast Delivery', 'Top Rated', 'Reliable'],
  };

  const recentJobs = [
    { route: 'Koramangala → Indiranagar', date: 'Today', rating: 5, amount: 110 },
    { route: 'Brigade Road → Electronic City', date: 'Yesterday', rating: 4, amount: 280 },
    { route: 'Whitefield → HSR Layout', date: '2 days ago', rating: 5, amount: 200 },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Agent Profile</h1>
          <button className="p-2 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="card-dark text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-black">
              {profileData.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-foreground">{profileData.name}</h2>
            <p className="text-muted-foreground">{profileData.wallet}</p>
            <p className="text-sm text-muted-foreground">Member since {profileData.memberSince}</p>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.floor(profileData.rating) ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}
                />
              ))}
            </div>
            <span className="font-bold text-foreground">{profileData.rating}</span>
            <span className="text-muted-foreground">({profileData.totalJobs} jobs)</span>
          </div>

          <div className="flex justify-center space-x-2">
            {profileData.badges.map((badge) => (
              <span key={badge} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-lg font-medium">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="card-dark">
          <h3 className="text-lg font-semibold text-foreground mb-4">Performance Stats</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2 text-primary mb-1">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">Total Earnings</span>
              </div>
              <p className="text-2xl font-bold text-foreground">₹{profileData.totalEarnings.toLocaleString()}</p>
            </div>

            <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
              <div className="flex items-center space-x-2 text-accent mb-1">
                <MapPin size={16} />
                <span className="text-sm font-medium">Jobs Completed</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{profileData.totalJobs}</p>
            </div>

            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
              <div className="flex items-center space-x-2 text-purple-400 mb-1">
                <Star size={16} />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{profileData.successRate}%</p>
            </div>

            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
              <div className="flex items-center space-x-2 text-yellow-400 mb-1">
                <Clock size={16} />
                <span className="text-sm font-medium">Avg Delivery</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{profileData.avgDeliveryTime}</p>
            </div>
          </div>
        </div>

        <div className="card-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Jobs</h3>
            <button className="text-primary hover:text-primary/80 transition-colors">View All</button>
          </div>
          
          <div className="space-y-3">
            {recentJobs.map((job, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{job.route}</p>
                  <p className="text-sm text-muted-foreground">{job.date}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= job.rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-primary">₹{job.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full gradient-button">
          Edit Profile
        </button>

        <div className="flex space-x-4">
          <button className="flex-1 py-3 bg-card text-foreground rounded-lg font-medium hover:bg-card/80 transition-colors">
            Earnings History
          </button>
          <button className="flex-1 py-3 bg-card text-foreground rounded-lg font-medium hover:bg-card/80 transition-colors">
            Settings
          </button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Profile;
