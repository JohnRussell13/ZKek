interface SecretKeyPageProps {
  secretKey: string;
  publicKey: string;
  copied: boolean;
  publicKeyCopied: boolean;
  onGenerateSecret: () => void;
  onCopySecret: () => void;
  onCopyPublicKey: () => void;
}

export default function SecretKeyPage({
  secretKey,
  publicKey,
  copied,
  publicKeyCopied,
  onGenerateSecret,
  onCopySecret,
  onCopyPublicKey,
}: SecretKeyPageProps) {
  return (
    <div className="p-6 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-3">
          Generate Secret Key
        </h2>
        <p className="text-slate-300 text-sm">
          Create a unique secret key for your private transactions
        </p>
      </div>

      <button
        onClick={onGenerateSecret}
        className="w-[30%] mx-auto px-4 py-2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 hover:via-purple-800 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 border border-purple-500/50 mb-6"
      >
        Generate New Secret Key
      </button>

      {secretKey && (
        <div>
          <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10 mb-6">
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-3 uppercase tracking-wide">
                Your Secret Key
              </p>
              <p className="text-sm text-white font-mono break-all leading-relaxed px-4">
                {secretKey}
              </p>
            </div>

            <div className="border-t border-white/10 pt-4 mb-4">
              <p className="text-xs text-slate-400 mb-3 uppercase tracking-wide">
                Your Public Key
              </p>
              <p className="text-sm text-emerald-400 font-mono break-all leading-relaxed px-4">
                {publicKey}
              </p>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-200 flex items-start gap-2">
                <span className="text-amber-400">⚠</span>
                <span>
                  Keep this secret key safe! You'll need it to withdraw your
                  funds. If you lose it, you won't be able to access the
                  deposit.
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onCopySecret}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-sm rounded-xl transition-all border border-white/10"
            >
              {copied ? "✓ Copied Secret" : "Copy Secret Key"}
            </button>
            <button
              onClick={onCopyPublicKey}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-sm rounded-xl transition-all border border-white/10"
            >
              {publicKeyCopied ? "✓ Copied Public" : "Copy Public Key"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
