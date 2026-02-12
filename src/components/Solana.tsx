import { useState } from "react";
import { deriveSolAddress } from "../lib/sol";

interface SolanaWalletProp{
    mnemonic : string | null;
}

export function SolanaWallet({mnemonic} : SolanaWalletProp){

    const [currentIndex , setCurrentIndex] = useState(0);
    const [publicKeys , setPublicKeys] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleDelete = (indexToDelete: number) => {
    setPublicKeys(prev => {
    const updated = prev.filter((_, i) => i !== indexToDelete);

    // No wallets left
    if (updated.length === 0) {
      setSelectedIndex(0);
      return [];
    }

    // If deleted wallet was selected
    if (indexToDelete === selectedIndex) {
      setSelectedIndex(0);
    }

    // If deleted wallet was before selected wallet
    if (indexToDelete < selectedIndex) {
      setSelectedIndex(prevIndex => prevIndex - 1);
    }

    return updated;
  });
};

    return(
        <div>
            <button onClick={ () => 
            { 
                if(!mnemonic)
                {
                    alert("Create or import a seed phrase first");
                    return;
                }
                const address = deriveSolAddress(mnemonic , currentIndex);
                setPublicKeys(prev => [...prev , address]);
                setCurrentIndex(i => i + 1);
            }}>
                Add SOL Wallet
            </button>
            
            {publicKeys.map((key, i) => (
            <div key={i}>
                <div>Sol Wallet {i} {i === selectedIndex && "(Active)"}</div>

                <div>{key}</div>

                <button onClick={() => setSelectedIndex(i)}>
                Select
                </button>

                <button
                onClick={() => {
                    navigator.clipboard.writeText(key);
                    alert("Address copied");

                }}>
                    Copy
                </button>

                <button
                onClick={() => {
                    const confirmDelete = window.confirm(
                    "This wallet can be re-derived from your seed phrase. Delete Wallet?"
                    );

                    if (confirmDelete) {
                    handleDelete(i);
                    }
                }}>
                    Delete
                </button>
            </div>
            ))}

        </div>
    )
}

