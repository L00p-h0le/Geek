import { useState } from "react";
import { deriveSolAddress } from "../lib/sol";
import { Toast } from "./Toast";
import { ConfirmModal } from "./ConfirmModal";

interface SolanaWalletProp {
    mnemonic: string | null;
}

export function SolanaWallet({ mnemonic }: SolanaWalletProp) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [publicKeys, setPublicKeys] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // UI state for custom modals/toasts
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error" | "info";
    } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const handleDelete = (indexToDelete: number) => {
        setPublicKeys((prev) => {
            const updated = prev.filter((_, i) => i !== indexToDelete);

            if (updated.length === 0) {
                setSelectedIndex(0);
                return [];
            }

            if (indexToDelete === selectedIndex) {
                setSelectedIndex(0);
            }

            if (indexToDelete < selectedIndex) {
                setSelectedIndex((prevIndex) => prevIndex - 1);
            }

            return updated;
        });
    };

    const truncateAddr = (addr: string) =>
        `${addr.slice(0, 6)}···${addr.slice(-4)}`;

    return (
        <div className="p-6 min-h-[300px]">
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center border border-primary/30">
                        <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.28 6.882a.672.672 0 00-.474-.196H3.494a.336.336 0 00-.237.574l3.226 3.232a.672.672 0 00.474.196h13.312a.336.336 0 00.237-.574l-3.226-3.232zM6.483 13.312a.672.672 0 00-.474.196L2.783 16.74a.336.336 0 00.237.574h13.312a.672.672 0 00.474-.196l3.226-3.232a.336.336 0 00-.237-.574H6.483z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-text">
                            Solana
                        </h2>
                        <span className="text-xs font-mono text-primary uppercase tracking-wider">
                            {publicKeys.length} wallet{publicKeys.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        if (!mnemonic) {
                            setToast({
                                message: "Create or import a seed phrase first",
                                type: "error",
                            });
                            return;
                        }
                        const address = deriveSolAddress(mnemonic, currentIndex);
                        setPublicKeys((prev) => [...prev, address]);
                        setCurrentIndex((i) => i + 1);
                    }}
                    className="px-4 py-2 text-sm font-mono bg-text text-bg hover:bg-accent rounded-sm transition-all duration-200 cursor-pointer"
                >
                    + Add Wallet
                </button>
            </div>

            {/* ─── Wallet List ─── */}
            {publicKeys.length > 0 && (
                <div className="animate-fade-in">
                    <div className="space-y-3">
                        {publicKeys.map((key, i) => (
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
                                        title={key}
                                    >
                                        <span className="hidden sm:inline">{key}</span>
                                        <span className="sm:hidden">{truncateAddr(key)}</span>
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
                                            onClick={() => setSelectedIndex(i)}
                                            className="px-2.5 py-1 text-xs font-mono text-accent/60 hover:text-text border border-transparent hover:border-primary/40 rounded-sm transition-all duration-200 cursor-pointer"
                                        >
                                            Select
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(key);
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
