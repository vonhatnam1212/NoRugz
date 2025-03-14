"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavItem,
  globalStyles,
} from "@/app/components/ui/navigation-menu";
import {
  Search,
  LineChart,
  Swords,
  TrendingUp,
  Users,
  Rocket,
  Target,
  Settings2,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";

// Matrix-style text scramble effect for the logo
class TextScramble {
  el: HTMLElement;
  chars: string;
  queue: Array<{
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }>;
  frame: number;
  frameRequest: number;
  resolve: (value: void | PromiseLike<void>) => void;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#₿Ξ◎Ð₳₮";
    this.queue = [];
    this.frame = 0;
    this.frameRequest = 0;
    this.resolve = () => {};
    this.update = this.update.bind(this);
  }

  setText(newText: string) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// Retro-pixel connect button for when not using RainbowKit
const MatrixConnectButton = () => {
  const router = useRouter();
  const { connect, isConnected } = useWallet();
  const [buttonHovered, setButtonHovered] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);

  const handleConnectClick = async () => {
    try {
      if (!isConnected) {
        await connect();
      } else {
        router.push("/marketplace");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      router.push("/marketplace");
    }
  };

  return (
    <button
      onClick={handleConnectClick}
      onMouseEnter={() => setButtonHovered(true)}
      onMouseLeave={() => setButtonHovered(false)}
      onMouseDown={() => setButtonPressed(true)}
      onMouseUp={() => setButtonPressed(false)}
      className={`
        font-pixel text-xs px-4 py-2 relative rounded-md
        ${
          buttonPressed
            ? "translate-y-[2px] shadow-none"
            : "shadow-[2px_2px_0px_#000]"
        }
        ${
          buttonHovered
            ? "bg-black text-retro-green border-2 border-retro-green"
            : "bg-retro-green text-black border-2 border-black"
        }
        transition-all duration-100
      `}
    >
      <div className="flex items-center justify-center">
        <Wallet
          className={`mr-2 h-4 w-4 ${
            buttonHovered ? "text-retro-green" : "text-black"
          }`}
        />
        <span>{isConnected ? "DASHBOARD" : "CONNECT"}</span>
      </div>
      {!buttonHovered && (
        <div className="absolute -inset-[1px] border border-retro-green opacity-50 rounded-md" />
      )}
    </button>
  );
};

// Retro-pixel styled RainbowKit ConnectButton
const MatrixRainbowButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="font-pixel text-sm px-4 py-2 bg-retro-green text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-black hover:text-retro-green hover:border-retro-green transition-colors duration-100 rounded-md"
                  >
                    <div className="flex items-center justify-center">
                      <Wallet className="mr-2 h-4 w-4 text-black" />
                      <span>CONNECT</span>
                    </div>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="font-pixel text-sm px-4 py-2 bg-red-600 text-white border-2 border-black shadow-[2px_2px_0px_#000]"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex items-center">
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="group font-pixel text-sm px-4 py-2 bg-retro-green text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-black hover:text-retro-green hover:border-retro-green transition-colors duration-100 relative rounded-md"
                    onMouseOver={(e) => {
                      e.currentTarget.style.clipPath = "none";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.clipPath = "none";
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className="flex items-center mr-3 pr-3 border-r border-black/30 group-hover:border-retro-green/30 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          openChainModal();
                        }}
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 14,
                              height: 14,
                              borderRadius: 999,
                              overflow: "hidden",
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                style={{ width: 14, height: 14 }}
                              />
                            )}
                          </div>
                        )}
                        <span className="text-xs text-black group-hover:text-retro-green">
                          {chain.name ? chain.name.split(" ")[0] : "Network"}
                        </span>
                      </div>

                      <Wallet className="mr-2 h-4 w-4 text-black group-hover:text-retro-green" />
                      <span
                        className="font-mono text-lg group-hover:text-retro-green"
                        style={{ color: "black" }}
                      >
                        {account.displayName.slice(0, 6)}...
                        {account.displayName.slice(-4)}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export function SiteHeader() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const scramblerRef = useRef<TextScramble | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if we're on the landing page
  const isLandingPage = pathname === "/";

  // Use wagmi account hook
  const { address, isConnected } = useAccount();

  // Use our wallet context
  const { disconnect } = useWallet();

  // Initialize text scramble effect for logo
  useEffect(() => {
    if (logoRef.current && !scramblerRef.current) {
      scramblerRef.current = new TextScramble(logoRef.current);
      setMounted(true);
    }
  }, []);

  // Apply text scramble effect on hover
  const handleLogoHover = () => {
    if (scramblerRef.current) {
      scramblerRef.current.setText("NORUGZ");
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Load authentication state and user data from localStorage on component mount
  useEffect(() => {
    // Check if connected via wagmi
    if (isConnected && address) {
      setIsAuthenticated(true);
      setUserAddress(address);
      return;
    }

    // Clear authentication if disconnected
    if (!isConnected) {
      setIsAuthenticated(false);
      setUserAddress(null);
      return;
    }

    // Only check localStorage if wagmi isn't connected
    const savedAuth = localStorage.getItem("isAuthenticated");
    const savedAddress = localStorage.getItem("userAddress");

    if (savedAuth === "true" && savedAddress) {
      setIsAuthenticated(true);
      setUserAddress(savedAddress);
    } else {
      setIsAuthenticated(false);
      setUserAddress(null);
    }
  }, [isConnected, address]);

  const publicMenuItems = useMemo(
    (): NavItem[] => [{ label: "Marketplace", href: "/marketplace" }],
    []
  );

  // Additional menu items for authenticated users
  const authenticatedMenuItems = useMemo(
    (): NavItem[] => [
      { label: "My Tokens", href: "/my-tokens" },
      { label: "Settings", href: "/settings" },
    ],
    []
  );

  // Memoize the combined menu items to prevent recreation on every render
  const menuItems = useMemo(
    () => [
      ...publicMenuItems,
      ...(isAuthenticated ? authenticatedMenuItems : []),
    ],
    [publicMenuItems, authenticatedMenuItems, isAuthenticated]
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b border-sky-400/20 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="w-full px-6 md:px-8 lg:px-12">
        <nav className="flex items-center justify-between h-20">
          {/* Logo - aligned to the left edge of the screen */}
          <div className="flex-shrink-0">
            <Link
              href="/marketplace"
              className="flex items-center space-x-2"
              onMouseEnter={handleLogoHover}
            >
              <span
                ref={logoRef}
                className="text-2xl font-bold text-retro-green font-pixel"
                style={{ textShadow: "0 0 5px rgba(74, 222, 128, 0.7)" }}
              >
                NORUGZ
              </span>
            </Link>
          </div>

          {/* Navigation Links - centered */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <NavigationMenu items={menuItems} />
          </div>

          {/* Connect Button and Mobile Menu Toggle - aligned to the right edge of the screen */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            {/* Only show connect button if not on landing page */}
            {!isLandingPage && <MatrixRainbowButton />}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white/80 hover:text-white"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#00ff00]/20 bg-black/95 backdrop-blur">
            <nav className="flex flex-col space-y-4 px-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-sm transition-colors ${
                    pathname === item.href
                      ? "text-white font-medium"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <style jsx global>{`
        .dud {
          color: #fff;
          opacity: 0.7;
        }
        ${globalStyles}
      `}</style>
    </header>
  );
}

export default SiteHeader;