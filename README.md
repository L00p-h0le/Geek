# G33K

G33K is a sleek, minimalist multi-chain Web3 wallet designed for a seamless user experience. Built with performance and security in mind, G33K allows users to manage their digital assets across Ethereum and Solana with ease.

## Features

- **Multi-Chain Support**: Manage Ethereum (ETH) and Solana (SOL) assets in one unified interface.
- **Secure Key Generation**: Industry-standard BIP39 mnemonic phrase generation for maximum security.
- **Modern UI**: A premium dark-mode aesthetic with fluid animations and a focus on clarity.
- **HD Wallet support**: Derive multiple accounts from a single seed phrase.
- **Real-time Balance**: Instant balance updates across all derived wallets.

## Project Structure

```text
/src
├── components      # React components including wallet implementations and animations
├── hooks           # Custom React hooks (e.g., usePreventScroll for dialogs)
├── lib             # Core blockchain logic and wallet derivation utilities
├── App.tsx         # Main application logic and layout
└── main.tsx        # Application entry point
```

## Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/L00p-h0le/Geek.git
   cd Geek
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Tech Stack

- **Framework**: React
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion & Motion Primitives
- **Blockchain**:
  - ethers.js (Ethereum)
  - @solana/web3.js (Solana)
- **Security**: bip39, ed25519-hd-key, tweetnacl

## License

Distributed under the MIT License.
