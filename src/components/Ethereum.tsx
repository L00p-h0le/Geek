import { useEffect, useState } from "react";
import { deriveEthaddress, deriveEthsigner, getEthbalance } from "../lib/eth";
import { parseEther, isAddress } from "ethers";
import { Toast } from "./Toast";
import { ConfirmModal } from "./ConfirmModal";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "./motion-primitives/dialog";

interface EthWalletProp {
    mnemonic: string | null;
}

export function EthWallet({ mnemonic }: EthWalletProp) {
    const [address, setAddressess] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedIndex, setselectedIndex] = useState(0);

    const [gasEstimate, setGasEstimate] = useState<string | null>(null);
    const [gasCostEth, setGasCostEth] = useState<string | null>(null);

    const [txStatus, setTxStatus] = useState<
        "idle" | "signing" | "pending" | "confirmed" | "error"
    >("idle");
    const [txhash, setTxHash] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [balance, setBalance] = useState<string>("0");

    const [to, setto] = useState("");
    const [amount, setamount] = useState("");

    const [sendDialogOpen, setSendDialogOpen] = useState(false);

    const resetDialogState = () => {
        setto("");
        setamount("");
        setTxStatus("idle");
        setTxHash(null);
        setErrorMessage(null);
        setGasEstimate(null);
        setGasCostEth(null);
    };

    // UI state for custom modals/toasts
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error" | "info";
    } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const handleDelete = (indexToDelete: number) => {
        setAddressess((prev) => {
            const updated = prev.filter((_, i) => i !== indexToDelete);

            if (updated.length == 0) {
                setselectedIndex(0);
                setBalance("0");
                return [];
            }

            if (indexToDelete == selectedIndex) {
                setselectedIndex(0);
            }

            if (indexToDelete < selectedIndex) {
                setselectedIndex((prevIndex) => prevIndex - 1);
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
            const signer = await deriveEthsigner(mnemonic, selectedIndex);
            const value = parseEther(amount);
            const estimatedGas = await signer.estimateGas({ to, value });
            const feeData = await signer.provider!.getFeeData();
            const gasPrice = feeData.gasPrice ?? 0n;
            const totalGasCost = estimatedGas * gasPrice;

            setGasEstimate(estimatedGas.toString());
            setGasCostEth((Number(totalGasCost) / 1e18).toFixed(8));
        } catch {
            setGasEstimate(null);
            setGasCostEth(null);
        }
    };

    useEffect(() => {
        if (!address.length) return;
        getEthbalance(address[selectedIndex]).then(setBalance);
    }, [address, selectedIndex]);

    const truncateAddr = (addr: string) =>
        `${addr.slice(0, 6)}···${addr.slice(-4)}`;

    const TX_BUTTON_LABELS: Record<string, string> = {
        signing: "Signing…",
        pending: "Pending…",
        idle: "Send ETH",
        confirmed: "Send Again",
        error: "Retry",
    };

    const customExitVariants = {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10 },
    };

    const handleSendTransaction = async () => {
        if (!mnemonic) return;

        setErrorMessage(null);
        setTxHash(null);

        if (!isAddress(to)) {
            setErrorMessage("Invalid Ethereum address");
            setTxStatus("error");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setErrorMessage("Enter a valid amount");
            setTxStatus("error");
            return;
        }

        try {
            setTxStatus("signing");

            const signer = await deriveEthsigner(
                mnemonic,
                selectedIndex
            );

            const value = parseEther(amount);

            const currentBalance =
                await signer.provider!.getBalance(signer.address);

            const estimatedGas = await signer.estimateGas({
                to,
                value,
            });
            const feeData = await signer.provider!.getFeeData();
            const gasPrice = feeData.gasPrice ?? 0n;
            const totalGasCost = estimatedGas * gasPrice;

            if (currentBalance < value + totalGasCost) {
                setErrorMessage("Insufficient balance for value + gas");
                setTxStatus("error");
                return;
            }

            const tx = await signer.sendTransaction({ to, value });

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
    };

    return (
        <div className="p-6 min-h-[300px]">
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center border border-primary/30">
                        <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-text">
                            Ethereum
                        </h2>
                        <span className="text-xs font-mono text-primary uppercase tracking-wider">
                            {address.length} wallet{address.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <button
                    onClick={async () => {
                        if (!mnemonic) {
                            setToast({
                                message: "Create or import a seed phrase first",
                                type: "error",
                            });
                            return;
                        }
                        const newAddress = await deriveEthaddress(mnemonic, currentIndex);
                        setAddressess((prev) => [...prev, newAddress]);
                        setCurrentIndex((i) => i + 1);
                    }}
                    className="px-4 py-2 text-sm font-mono bg-text text-bg hover:bg-accent rounded-sm transition-all duration-200 cursor-pointer"
                >
                    + Add Wallet
                </button>
            </div>

            {/* ─── Wallet List ─── */}
            {address.length > 0 && (
                <div className="animate-fade-in">
                    <div className="space-y-3">
                        {address.map((addr, i) => (
                            <div
                                key={i}
                                className={`group flex items-center justify-between py-4 px-4 rounded-sm border transition-all duration-200 animate-fade-in-up ${i === selectedIndex
                                    ? "bg-secondary/40 border-accent/30"
                                    : "border-primary/20 hover:bg-secondary/20 hover:border-primary/40"
                                    }`}
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Index */}
                                    <span className="text-xs font-mono text-primary w-5 text-center shrink-0">
                                        {i}
                                    </span>

                                    {/* Address */}
                                    <span
                                        className="font-mono text-base text-accent/80 cursor-pointer hover:text-text transition-colors duration-200 truncate"
                                        title={addr}
                                    >
                                        <span className="hidden sm:inline">{addr}</span>
                                        <span className="sm:hidden">{truncateAddr(addr)}</span>
                                    </span>

                                    {/* Active badge */}
                                    {i === selectedIndex && (
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-accent/50 px-2 py-0.5 border border-accent/20 rounded-sm animate-pulse-glow shrink-0">
                                            active
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                                    {i !== selectedIndex && (
                                        <button
                                            onClick={() => setselectedIndex(i)}
                                            className="px-2.5 py-1 text-xs font-mono text-accent/60 hover:text-text border border-transparent hover:border-primary/40 rounded-sm transition-all duration-200 cursor-pointer"
                                        >
                                            Select
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(addr);
                                            setToast({ message: "Address copied", type: "success" });
                                        }}
                                        className="px-2.5 py-1 text-xs font-mono text-accent/60 hover:text-text border border-transparent hover:border-primary/40 rounded-sm transition-all duration-200 cursor-pointer"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(i)}
                                        className="px-2.5 py-1 text-xs font-mono text-accent/60 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded-sm transition-all duration-200 cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>



                    {/* ─── Send ETH Button + Dialog ─── */}
                    <div className="mt-8">
                        <Dialog
                            variants={customExitVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            open={sendDialogOpen}
                            onOpenChange={(open) => {
                                if (open) resetDialogState();
                                setSendDialogOpen(open);
                            }}
                        >
                            <DialogTrigger
                                className="w-full py-3 text-base font-medium bg-text text-bg hover:bg-accent rounded-sm transition-all duration-200 cursor-pointer"
                            >
                                Send ETH
                            </DialogTrigger>

                            <DialogContent className="w-[90vw] max-w-md bg-bg border border-primary/30 rounded-sm p-0">
                                <div className="p-6">
                                    <DialogHeader className="mb-6">
                                        <DialogTitle className="text-lg font-semibold tracking-tight text-text">
                                            Send ETH
                                        </DialogTitle>
                                    </DialogHeader>
                                    <DialogClose className="text-accent/50 hover:text-text transition-colors" />

                                    {/* Balance inside dialog */}
                                    <div className="mb-6 p-4 bg-secondary/30 border border-primary/20 rounded-sm">
                                        <span className="text-xs font-mono text-primary uppercase tracking-wider">Balance</span>
                                        <div className="mt-1 flex items-baseline gap-2">
                                            <span className="text-2xl font-semibold tracking-tight text-text">{balance}</span>
                                            <span className="text-base font-mono text-accent/40">ETH</span>
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-mono text-accent/40 uppercase tracking-wider mb-2">
                                                Recipient
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="0x…"
                                                value={to}
                                                onChange={(e) => {
                                                    setto(e.target.value);
                                                    previewGas();
                                                }}
                                                className="w-full bg-bg border border-primary/30 focus:border-accent/50 rounded-sm px-4 py-3 text-base font-mono text-text placeholder:text-primary/60 outline-none transition-colors duration-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-mono text-accent/40 uppercase tracking-wider mb-2">
                                                Amount
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => {
                                                    setamount(e.target.value);
                                                    previewGas();
                                                }}
                                                className="w-full bg-bg border border-primary/30 focus:border-accent/50 rounded-sm px-4 py-3 text-base font-mono text-text placeholder:text-primary/60 outline-none transition-colors duration-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Gas Preview */}
                                    {gasEstimate && gasCostEth && (
                                        <div className="mt-4 animate-fade-in bg-secondary/30 border border-primary/20 rounded-sm p-4">
                                            <span className="text-xs font-mono text-accent/40 uppercase tracking-wider block mb-2">
                                                Gas Estimate
                                            </span>
                                            <div className="text-sm font-mono text-accent/70 space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-primary">Units</span>
                                                    <span>{gasEstimate}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-primary">Fee</span>
                                                    <span>{gasCostEth} ETH</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Send button inside dialog */}
                                    <button
                                        disabled={txStatus === "signing" || txStatus === "pending"}
                                        onClick={handleSendTransaction}
                                        className={`w-full mt-6 py-3 text-base font-medium rounded-sm transition-all duration-200 cursor-pointer ${txStatus === "signing" || txStatus === "pending"
                                            ? "bg-primary/30 text-accent/40 cursor-not-allowed"
                                            : "bg-text text-bg hover:bg-accent"
                                            }`}
                                    >
                                        {TX_BUTTON_LABELS[txStatus]}
                                    </button>

                                    {/* Status messages */}
                                    {txStatus === "pending" && (
                                        <div className="mt-4 animate-fade-in flex items-center gap-2 text-sm font-mono text-yellow-500/80 bg-yellow-500/5 border border-yellow-500/20 rounded-sm px-3 py-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                            Transaction pending…
                                        </div>
                                    )}

                                    {txStatus === "confirmed" && txhash && (
                                        <div className="mt-4 animate-fade-in text-sm font-mono text-green-500/80 bg-green-500/5 border border-green-500/20 rounded-sm px-3 py-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-green-500">✓</span>
                                                Confirmed
                                            </div>
                                            <div
                                                className="text-xs text-green-500/50 truncate cursor-pointer hover:text-green-500/80 transition-colors"
                                                title={txhash}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(txhash);
                                                    setToast({
                                                        message: "Tx hash copied",
                                                        type: "success",
                                                    });
                                                }}
                                            >
                                                {txhash}
                                            </div>
                                        </div>
                                    )}

                                    {txStatus === "error" && errorMessage && (
                                        <div className="mt-4 animate-shake text-sm font-mono text-red-400/80 bg-red-500/5 border border-red-500/20 rounded-sm px-3 py-2 flex items-center gap-2">
                                            <span className="text-red-400">✕</span>
                                            {errorMessage}
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}

            {/* ─── Toasts ─── */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* ─── Delete Confirmation Modal ─── */}
            {confirmDelete !== null && (
                <ConfirmModal
                    title="Delete Wallet"
                    message="This wallet can be re-derived from your seed phrase. Are you sure?"
                    confirmLabel="Delete"
                    cancelLabel="Keep"
                    variant="danger"
                    onConfirm={() => {
                        handleDelete(confirmDelete);
                        setConfirmDelete(null);
                    }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
        </div>
    );
}