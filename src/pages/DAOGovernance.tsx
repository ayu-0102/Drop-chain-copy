
import { useState } from 'react';
import { ArrowLeft, Plus, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';

const DAOGovernance = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Disputes');

  const stats = {
    activeDisputes: 2,
    openProposals: 2,
    daoMembers: 156,
  };

  const disputes = [
    {
      id: '#J1234',
      type: 'Payment Dispute',
      timeAgo: '2 hours ago',
      description: 'Agent claims delivery completed but customer denies receiving item',
      customer: '0x1234...5678',
      agent: '0x8765...4321',
      amount: 150,
      status: 'active',
    },
    {
      id: '#J1235',
      type: 'Service Quality',
      timeAgo: '1 day ago',
      description: 'Customer reports damaged item during delivery',
      customer: '0x2345...6789',
      agent: '0x9876...5432',
      amount: 200,
      status: 'active',
    },
  ];

  const proposals = [
    {
      id: 1,
      title: 'Increase minimum delivery fee to ₹60',
      description: 'Adjust base rate to account for rising fuel costs',
      timeLeft: '5 days left',
      votesFor: 127,
      votesAgainst: 23,
      totalVotes: 150,
      userWallet: '0x1111...2222',
    },
    {
      id: 2,
      title: 'Implement agent verification system',
      description: 'Require ID verification for all new agents',
      timeLeft: '12 days left',
      votesFor: 89,
      votesAgainst: 45,
      totalVotes: 134,
      userWallet: '0x3333...4444',
    },
  ];

  const handleVote = (proposalId: number, vote: 'for' | 'against') => {
    console.log(`Voted ${vote} on proposal ${proposalId}`);
  };

  const handleResolveDispute = (disputeId: string) => {
    console.log(`Resolving dispute ${disputeId}`);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">DAO Governance</h1>
            <p className="text-muted-foreground">Manage disputes and platform governance</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="card-dark text-center">
            <div className="text-2xl font-bold text-destructive">{stats.activeDisputes}</div>
            <div className="text-sm text-muted-foreground">Active Disputes</div>
          </div>
          <div className="card-dark text-center">
            <div className="text-2xl font-bold text-accent">{stats.openProposals}</div>
            <div className="text-sm text-muted-foreground">Open Proposals</div>
          </div>
          <div className="card-dark text-center">
            <div className="text-2xl font-bold text-primary">{stats.daoMembers}</div>
            <div className="text-sm text-muted-foreground">DAO Members</div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('Disputes')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'Disputes' 
                ? 'bg-destructive text-destructive-foreground' 
                : 'bg-card text-foreground hover:bg-card/80'
            }`}
          >
            Disputes
          </button>
          <button
            onClick={() => setActiveTab('Proposals')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'Proposals' 
                ? 'bg-accent text-accent-foreground' 
                : 'bg-card text-foreground hover:bg-card/80'
            }`}
          >
            Proposals
          </button>
        </div>

        {activeTab === 'Disputes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Active Disputes</h3>
              <button className="px-4 py-2 bg-destructive/20 text-destructive rounded-lg font-medium hover:bg-destructive/30 transition-colors">
                Create Report
              </button>
            </div>

            {disputes.map((dispute) => (
              <div key={dispute.id} className="card-dark space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={20} className="text-yellow-400" />
                    <div>
                      <span className="font-semibold text-foreground">{dispute.type}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{dispute.id}</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{dispute.timeAgo}</span>
                </div>

                <p className="text-foreground">{dispute.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="ml-2 text-foreground">{dispute.customer}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Agent:</span>
                    <span className="ml-2 text-foreground">{dispute.agent}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-lg font-bold text-destructive">₹{dispute.amount}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResolveDispute(dispute.id)}
                      className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors"
                    >
                      Resolve
                    </button>
                    <button className="px-4 py-2 bg-card text-foreground rounded-lg font-medium hover:bg-card/80 transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Proposals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Active Proposals</h3>
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                Create New Proposal
              </button>
            </div>

            {proposals.map((proposal) => (
              <div key={proposal.id} className="card-dark space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{proposal.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">{proposal.timeLeft}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Voting Progress</span>
                    <span className="text-foreground">{proposal.totalVotes} votes</span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-primary">For: {proposal.votesFor}</span>
                    <span className="text-destructive">Against: {proposal.votesAgainst}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  by <span className="text-foreground">{proposal.userWallet}</span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleVote(proposal.id, 'for')}
                    className="flex-1 py-2 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors"
                  >
                    Vote For
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'against')}
                    className="flex-1 py-2 bg-destructive/20 text-destructive rounded-lg font-medium hover:bg-destructive/30 transition-colors"
                  >
                    Vote Against
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default DAOGovernance;
