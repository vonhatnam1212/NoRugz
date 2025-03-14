"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "./components/profile-settings";
import { SocialSettings } from "./components/social-settings";
import { PreferenceSettings } from "./components/preference-settings";
import { WalletSettings } from "./components/wallet-settings";
import { User, Share2, Settings2, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Update wallet address when connection status changes
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    } else {
      // Try to get from localStorage as fallback
      const savedAddress = localStorage.getItem("userAddress");
      setWalletAddress(savedAddress);
    }
  }, [isConnected, address]);

  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-b">
        <div className="container max-w-5xl mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col gap-4 pt-12 pb-8 text-center">
            <h1 className="text-4xl font-bold">
              Account{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">
                Settings
              </span>
            </h1>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="space-y-10">
            <div className="flex justify-center">
              <TabsList className="bg-white/5 p-1 rounded-lg grid grid-cols-2 w-full max-w-md">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-black/50 data-[state=active]:text-retro-green gap-2 py-3"
                >
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="wallet"
                  className="data-[state=active]:bg-black/50 data-[state=active]:text-retro-green gap-2 py-3"
                >
                  <Wallet className="h-4 w-4" />
                  Wallet
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="profile"
              className="mt-0 bg-black/20 p-6 rounded-lg border border-white/10"
            >
              <ProfileSettings />
            </TabsContent>

            <TabsContent
              value="wallet"
              className="mt-0 bg-black/20 p-6 rounded-lg border border-white/10"
            >
              <WalletSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}