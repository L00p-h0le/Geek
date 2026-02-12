# Wault 🚀

**Wault** is a sleek, minimalist, and powerful multi-chain Web3 wallet designed for a seamless user experience. Built with performance and security in mind, Wault allows users to manage their digital assets across multiple blockchains with ease.

---

## 🌟 Features

- **Multi-Chain Support**: Manage Ethereum (ETH) and Solana (SOL) assets in one place.
- **Secure Key Management**: Industry-standard mnemonic phrase generation and secure key handling.
- **Modern UI**: A clean, "Light Slate" aesthetic optimized for clarity and ease of use.
- **Developer Friendly**: Built with React, TypeScript, and Vite for a lightning-fast development experience.

---

## 📂 Project Structure

```text
/src
├── components      # UI components (Ethereum.tsx, Solana.tsx, etc.)
├── lib             # Blockchain logic and wallet utilities (eth.ts, sol.ts)
├── Store           # State management for wallet data
├── assets          # Static assets and images
├── App.tsx         # Main application entry point
└── main.tsx        # React mounting and global styles
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/L00p-h0le/Geek.git
   cd Geek
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Blockchain**:
  - [ethers.js](https://docs.ethers.org/) (Ethereum)
  - [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/) (Solana)
- **Security**: [tweetnacl](https://github.com/dchest/tweetnacl-js), [bip39](https://github.com/bitcoinjs/bip39)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
