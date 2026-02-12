import { useState } from 'react'
import { generateMnemonic } from 'bip39';
import './App.css'
import { EthWallet } from './components/Ethereum';
import { SolanaWallet } from './components/Solana';

function App() {
  
  const[mnemonic , setmnemonic] = useState<string | null>(null);

  return (
    <div>
      <button onClick={function(){
        const mn = generateMnemonic();
        setmnemonic(mn)
      }}>
        Create Seed Phrase
      </button>
      <input type="text" value={mnemonic ?? ""}></input>
      <EthWallet mnemonic={mnemonic} />
      <SolanaWallet mnemonic={mnemonic} />
    </div>
  )
}

export default App
