# DeliverDAO - Decentralized Delivery Platform on Internet Computer

A decentralized food delivery platform built on the Internet Computer Protocol (ICP) that eliminates middlemen and connects customers directly with delivery agents.

## Features

- **AI-Powered Ordering**: Natural language processing for food orders
- **Blockchain Integration**: Smart contracts on Internet Computer Protocol
- **Direct Payments**: Peer-to-peer payments without intermediaries
- **Agent Dashboard**: Real-time job management for delivery agents
- **DAO Governance**: Decentralized dispute resolution and platform governance

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain**: Internet Computer Protocol (ICP)
- **Smart Contracts**: Motoko
- **Authentication**: Internet Identity
- **State Management**: React Context API
- **Build Tool**: Vite

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (Internet Computer SDK)
- [Internet Identity](https://identity.ic0.app/) for authentication

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd deliverdao
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install DFX (if not already installed)**
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

## Development Setup

1. **Start the local Internet Computer replica**
   ```bash
   dfx start --background
   ```

2. **Deploy the canisters locally**
   ```bash
   dfx deploy
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## Deployment Commands

### Local Development
```bash
# Start local replica
dfx start --background

# Deploy to local network
npm run deploy:local

# Stop local replica
npm run stop
```

### Production Deployment
```bash
# Deploy to Internet Computer mainnet
npm run deploy:ic
```

## Smart Contract Architecture

The platform uses Motoko smart contracts deployed on ICP:

### DeliveryPlatform.mo
- **Agent Registration**: Register delivery agents on-chain
- **Order Management**: Post, confirm, and complete orders
- **Payment Processing**: Handle payments between customers and agents
- **Dispute Resolution**: Manage order disputes and resolutions

### Key Functions
- `registerAgent(name: Text)`: Register as a delivery agent
- `postOrder(...)`: Create a new delivery order
- `confirmOrder(orderId: Nat)`: Agent confirms an order
- `payAgent(orderId: Nat, amount: Float)`: Customer pays agent

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── contracts/          # Motoko smart contracts
├── pages/             # Application pages
├── utils/             # Utility functions and ICP integration
└── hooks/             # Custom React hooks

dfx.json               # DFX configuration
package.json           # Node.js dependencies
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
REACT_APP_CANISTER_ID=your_canister_id_here
REACT_APP_INTERNET_IDENTITY_CANISTER_ID=rdmx6-jaaaa-aaaah-qdrva-cai
REACT_APP_DFX_NETWORK=local
```

## Usage

### For Customers
1. Connect with Internet Identity
2. Enter delivery location
3. Describe your food order in natural language
4. Review AI-extracted order details
5. Post order to ICP blockchain
6. Wait for agent confirmation
7. Pay agent directly on completion

### For Delivery Agents
1. Connect with Internet Identity
2. Register as an agent on ICP blockchain
3. Browse available delivery jobs
4. Confirm jobs you want to take
5. Complete deliveries and receive payments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in this repository
- Join our community discussions
- Check the [Internet Computer documentation](https://internetcomputer.org/docs/)

## Roadmap

- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced AI features
- [ ] Integration with more payment methods
- [ ] Enhanced DAO governance features
- [ ] Cross-chain compatibility

---

Built with ❤️ on the Internet Computer Protocol