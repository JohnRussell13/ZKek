interface WithdrawPageProps {
  withdrawSecretKey: string;
  leafIndex: string;
  loading: boolean;
  onWithdrawSecretKeyChange: (value: string) => void;
  onLeafIndexChange: (value: string) => void;
  onWithdraw: () => void;
}

export default function WithdrawPage({
  withdrawSecretKey,
  leafIndex,
  loading,
  onWithdrawSecretKeyChange,
  onLeafIndexChange,
  onWithdraw,
}: WithdrawPageProps) {
  return (
    <div className="p-6 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-3">
          Withdraw Funds
        </h2>
        <p className="text-slate-300 text-sm">
          Withdraw your funds privately using your secret key
        </p>
      </div>

      <div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Secret Key
          </label>
          <input
            type="text"
            value={withdrawSecretKey}
            onChange={(e) => onWithdrawSecretKeyChange(e.target.value)}
            placeholder="Enter your secret key"
            className="w-full px-6 py-5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 font-mono text-sm transition-all text-center"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Leaf Index
          </label>
          <input
            type="text"
            value={leafIndex}
            onChange={(e) => onLeafIndexChange(e.target.value)}
            placeholder="Enter leaf index from deposit"
            className="w-full px-6 py-5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-center"
          />
        </div>

        <button
          onClick={onWithdraw}
          disabled={loading || !withdrawSecretKey || !leafIndex}
          className="w-[30%] mx-auto px-4 py-2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 hover:via-purple-800 disabled:from-slate-800 disabled:via-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 disabled:shadow-none border border-purple-500/50 disabled:border-slate-600"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            "Initiate Withdrawal"
          )}
        </button>
      </div>
    </div>
  );
}
