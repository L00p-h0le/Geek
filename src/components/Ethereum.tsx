import { useEffect, useState } from "react";
import { deriveEthaddress, deriveEthsigner, getEthbalance } from "../lib/eth";
import { parseEther , isAddress} from "ethers";

interface EthWalletProp{
    mnemonic: string | null;
}

export function EthWallet({mnemonic}: EthWalletProp){

    const [address , setAddressess] = useState<string[]>([]);
    const [currentIndex , setCurrentIndex] = useState(0);
    const [selectedIndex , setselectedIndex] = useState(0);

    const [gasEstimate, setGasEstimate] = useState<string | null>(null);
    const [gasCostEth, setGasCostEth] = useState<string | null>(null);


    const [txStatus , setTxStatus] = useState<"idle" | "signing" | "pending" | "confirmed" | "error">("idle");
    const [txhash , setTxHash] = useState<string | null>(null);
    const [errorMessage , setErrorMessage] = useState<string | null>(null);

    const [balance , setBalance] = useState<string>("0");

    const[to , setto] = useState("");
    const [amount , setamount] = useState("");

    const handleDelete = (indexToDelete: number) => {
        setAddressess(prev => {
            const updated = prev.filter((_, i) => i !== indexToDelete);

            //If no wallets left
            if(updated.length == 0){
                setselectedIndex(0);
                setBalance("0");
                return [];
            }

            //If deleted wallet was selected
            if(indexToDelete == selectedIndex){
                setselectedIndex(0);
            }

            //If deleted wallet was before selected index
            if(indexToDelete < selectedIndex){
                setselectedIndex(prevIndex => prevIndex - 1);
            }

            return updated;
        });
    };

    const previewGas = async () => {
    if (!mnemonic) return;

    if (!isAddress(to) || !amount || Number(amount) <= 0) {
        setGasEstimate(null);
        setGasCostEth(null);
        return;
    }

    try {
        const signer = await deriveEthsigner(
        mnemonic,
        selectedIndex
        );

        const value = parseEther(amount);

        const estimatedGas = await signer.estimateGas({
        to,
        value,
        });

        const feeData = await signer.provider!.getFeeData();

        const gasPrice = feeData.gasPrice ?? 0n;

        const totalGasCost = estimatedGas * gasPrice;

        setGasEstimate(estimatedGas.toString());
        setGasCostEth(
        (Number(totalGasCost) / 1e18).toFixed(8)
        );
    } catch (err) {
        setGasEstimate(null);
        setGasCostEth(null);
    }
};


    //Fetch Balance when selected wallet changes
    useEffect(() => {
        if(!address.length) return;

        getEthbalance(address[selectedIndex]).then(setBalance);
    } , [address , selectedIndex]);

    return(
    <div>
        <button onClick={async() => 
            { 
                if(!mnemonic)
                    {
                        alert("Create or import a seed phrase first");
                        return;
                }
                const newAddress = await deriveEthaddress(mnemonic , currentIndex);
                setAddressess(prev => [...prev , newAddress]);
                setCurrentIndex(i => i + 1);
            }
        }>
            Add Eth Wallet
        </button>

                {address.map((addr , i) =>(
            <div key = {i}>
                <div>
                    Wallet {i} {i == selectedIndex && "(Active)"}
                </div>
                <div>{addr}</div>

                <button onClick={() => setselectedIndex(i)}>
                    Select
                </button>

                <button onClick={() => {
                    navigator.clipboard.writeText(addr);
                    alert("Adress Copied");
                }}>
                    Copy
                </button>

                <button onClick={async() => {
                    const confirmdeletion = await window.confirm("This wallet can be re-derived from your seed phrase. Delete Wallet?");

                    if(confirmdeletion){
                        handleDelete(i);
                    }
                }}>
                    Delete
                </button>
            </div>
        ))}

        {address.length > 0 && (
            <div>
                <h3>Balance</h3>
                <div>{balance} ETH</div>

                <h3>Send Eth</h3>

                <input type="text" placeholder="Recipient Address" value={to} onChange={(e) => {setto(e.target.value); previewGas();}} />
                <input type="text" placeholder="Amount (ETH)" value={amount} onChange={(e) => {setamount(e.target.value); previewGas();}} />

                {gasEstimate && gasCostEth && (
                    <div style={{ marginTop: "10px", fontSize: "14px" }}>
                        Estimated Gas: {gasEstimate} units
                        <br />
                        Estimated Fee: {gasCostEth} ETH
                    </div>
                )}


                <button
                disabled={txStatus === "signing" || txStatus === "pending"}
                onClick={async () => {
                    if (!mnemonic) return;

                    setErrorMessage(null);
                    setTxHash(null);

                    if (!isAddress(to)) {
                    setErrorMessage("Invalid Ethereum address");
                    return;
                    }

                    if (!amount || Number(amount) <= 0) {
                    setErrorMessage("Enter a valid amount");
                    return;
                    }

                    try {
                    setTxStatus("signing");

                    const signer = await deriveEthsigner(
                        mnemonic,
                        selectedIndex
                    );

                    const value = parseEther(amount);

                    const currentBalance = await signer.provider!.getBalance(
                        signer.address
                    );

                    //  Proper BigInt comparison
                    const estimatedGas = await signer.estimateGas({ to, value });
                    const feeData = await signer.provider!.getFeeData();
                    const gasPrice = feeData.gasPrice ?? 0n;
                    const totalGasCost = estimatedGas * gasPrice;

                    if (currentBalance < value + totalGasCost) {
                        setErrorMessage("Insufficient balance for value + gas");
                        setTxStatus("error");
                        return;
                    }


                    const tx = await signer.sendTransaction({
                        to,
                        value,
                    });

                    setTxHash(tx.hash);
                    setTxStatus("pending");

                    const receipt = await tx.wait();

                    if (receipt?.status === 1) {
                        setTxStatus("confirmed");
                    } else {
                        setErrorMessage("Transaction reverted");
                        setTxStatus("error");
                    }

                    const updatedBalance = await getEthbalance(
                        signer.address
                    );

                    setBalance(updatedBalance);
                    setto("");
                    setamount("");
                    } catch (err: any) {
                    console.error("Transaction error:", err);

                    if (err.code === "INSUFFICIENT_FUNDS") {
                        setErrorMessage("Insufficient funds");
                    } else if (err.code === "NETWORK_ERROR") {
                        setErrorMessage("Network error. Try again.");
                    } else if (err.code === "ACTION_REJECTED") {
                        setErrorMessage("Transaction rejected.");
                    } else {
                        setErrorMessage("Transaction failed.");
                    }

                    setTxStatus("error");
                    }

                }}
                >
                {txStatus === "signing" && "Signing..."}
                {txStatus === "pending" && "Pending..."}
                {txStatus === "idle" && "Send ETH"}
                {txStatus === "confirmed" && "Send Again"}
                {txStatus === "error" && "Retry"}
                </button>


                {txStatus === "pending" && (
                <div style={{ marginTop: "10px", color: "orange" }}>
                    Transaction pending...
                </div>
                )}

                {txStatus === "confirmed" && txhash && (
                <div style={{ marginTop: "10px", color: "green" }}>
                    Transaction confirmed! <br />
                    Hash: {txhash}
                </div>
                )}

                {txStatus === "error" && errorMessage && (
                <div style={{ marginTop: "10px", color: "red" }}>
                    Error: {errorMessage}
                </div>
                )}

            </div>
        )}
    </div>
)
}