import { useState } from "react";
import { motion } from "motion/react";
import { generateMnemonic } from "bip39";
import { EthWallet } from "./components/Ethereum";
import { SolanaWallet } from "./components/Solana";
import { Toast } from "./components/Toast";
import { BorderTrail } from "./components/motion-primitives/border-trail";
import { TextScramble } from "./components/motion-primitives/text-scramble";
import { TextEffect } from "./components/motion-primitives/text-effect";

type WalletType = "ethereum" | "solana";

function App() {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [copied, setCopied] = useState(false);
  const [generationKey, setGenerationKey] = useState(0);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);

  const handleGenerate = () => {
    const mn = generateMnemonic();
    setMnemonic(mn);
    setGenerationKey((prev) => prev + 1);
    setToast({ message: "Seed phrase generated", type: "success" });
  };

  const handleCopyMnemonic = () => {
    if (!mnemonic) return;
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const words = mnemonic ? mnemonic.split(" ") : [];

  // ─── Wallet Page (full-page view when a blockchain is selected) ─── 
  if (selectedWallet) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-primary/30">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-[0.4em] text-text">
              G33K
            </h1>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-6 py-10">
          {selectedWallet === "ethereum" ? (
            <EthWallet mnemonic={mnemonic} />
          ) : (
            <SolanaWallet mnemonic={mnemonic} />
          )}
        </section>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  // ─── Landing Page (single viewport) ─── 
  return (
    <div className="h-screen bg-bg text-text flex flex-col overflow-hidden">
      {/* ─── Top Bar ─── */}
      <header className="shrink-0 bg-bg/90 backdrop-blur-md border-b border-primary/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-[0.4em] text-text">
            <TextEffect per="char" preset="fade">
              G33K
            </TextEffect>
          </h1>

        </div>
      </header>

      {/* ─── Main Content (fills remaining viewport) ─── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-2xl">

          {/* ─── Welcome Page (before seed phrase) ─── */}
          {!mnemonic && (
            <div className="flex flex-col items-center justify-center space-y-0">
              <TextEffect
                per="char"
                delay={0.5}
                as="h2"
                className="text-4xl font-bold tracking-[0.25em] text-text mb-3"
                variants={{
                  container: {
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 },
                    },
                  },
                  item: {
                    hidden: { opacity: 0, rotateX: 90, y: 10 },
                    visible: {
                      opacity: 1,
                      rotateX: 0,
                      y: 0,
                      transition: { duration: 0.2 },
                    },
                  },
                }}
              >
                Welcome to G33K
              </TextEffect>
              <TextEffect
                per="char"
                delay={1.5}
                as="p"
                className="text-lg tracking-[0.15em] text-primary font-mono"
              >
                Your personalized Wallet Generator
              </TextEffect>
              <motion.div
                className="pt-12"
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 2.5, duration: 0.6 }}
              >
                <button
                  onClick={handleGenerate}
                  className="px-8 py-4 text-base font-medium bg-text text-bg hover:bg-accent rounded-sm transition-all duration-200 cursor-pointer"
                >
                  Generate Seed Phrase
                </button>
              </motion.div>
            </div>
          )}

          {/* ─── Seed Phrase Page (after generation) ─── */}
          {mnemonic && (
            <div className="animate-fade-in-up">
              {/* Recovery Phrase heading */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-mono uppercase tracking-[0.15em] text-accent/70 mb-2">
                  Recovery Phrase
                </h2>
                <p className="text-base text-primary font-mono">
                  This is 12-word BIP39 mnemonic Seed Phrase.
                </p>
              </div>

              {/* Seed phrase grid */}
              <div className="relative bg-secondary/50 border border-primary/30 rounded-sm p-5 overflow-hidden">
                <BorderTrail
                  style={{
                    boxShadow:
                      '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
                  }}
                  size={100}
                />

                <div className="grid grid-cols-3 gap-2">
                  {words.map((word, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 bg-bg/40 border border-primary/20 rounded-sm"
                    >
                      <span className="text-xs font-mono text-primary w-4 text-right select-none">
                        {i + 1}
                      </span>
                      <TextScramble
                        key={`${generationKey}-${i}`}
                        className="text-base font-mono text-text"
                        as="span"
                        speed={0.03}
                        trigger={true}
                      >
                        {word}
                      </TextScramble>
                    </div>
                  ))}
                </div>

                {/* Copy + Regenerate */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={handleCopyMnemonic}
                    className="flex items-center gap-2 text-sm font-mono text-accent/50 hover:text-accent transition-colors duration-200 cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                    </svg>
                    {copied ? "Copied to clipboard" : "Copy phrase"}
                  </button>

                  <button
                    onClick={handleGenerate}
                    className="text-sm font-mono text-accent/50 hover:text-accent transition-colors duration-200 cursor-pointer"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Warning sub-text */}
              <p className="mt-3 text-center text-sm font-mono text-red-400/70">
                Anyone with seed phrase will have access to your wallets. NEVER SHARE IT!!
              </p>

              {/* ─── Wallet Selection ─── */}
              <div className="flex flex-col items-center gap-4 mt-8 animate-fade-in-up">
                <h2 className="text-base font-mono uppercase tracking-[0.15em] text-accent/50">
                  Select Blockchain
                </h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedWallet("ethereum")}
                    className="px-8 py-3 text-base font-medium bg-text text-bg hover:bg-accent rounded-sm transition-all duration-200 cursor-pointer"
                  >
                    Ethereum
                  </button>
                  <button
                    onClick={() => setSelectedWallet("solana")}
                    className="px-8 py-3 text-base font-medium bg-text text-bg hover:bg-accent rounded-sm transition-all duration-200 cursor-pointer"
                  >
                    Solana
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="shrink-0 border-t border-primary/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-mono text-primary">
            G33K v0.1.0
          </span>
          <span className="text-sm font-mono text-primary/50">
            HD Wallet Generator
          </span>
        </div>
      </footer>

      {/* ─── Toast ─── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
