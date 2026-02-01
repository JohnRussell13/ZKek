import WalletButton from "./WalletButton";

type Page = "secret" | "deposit" | "withdraw";

interface HeaderProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function Header({ currentPage, onPageChange }: HeaderProps) {
  const pages: { id: Page; label: string; color: string }[] = [
    { id: "secret", label: "Secret Key", color: "purple" },
    { id: "deposit", label: "Deposit", color: "blue" },
    { id: "withdraw", label: "Withdraw", color: "green" },
  ];

  const getButtonClasses = (page: { id: Page; color: string }) => {
    const isActive = currentPage === page.id;
    const baseClasses =
      "px-8 py-4 text-lg font-semibold transition-all duration-300 rounded-lg";

    if (isActive) {
      return `${baseClasses} text-purple-400`;
    }

    return `${baseClasses} text-slate-400 hover:text-white hover:bg-white/5`;
  };

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center relative">
          <div className="absolute left-0 px-8 py-2">
            <h1 className="text-3xl font-bold text-white">ZKek</h1>
          </div>

          <nav className="flex gap-3">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageChange(page.id)}
                className={getButtonClasses(page)}
              >
                {page.label}
              </button>
            ))}
          </nav>

          <div className="absolute right-0 px-8 py-2">
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
