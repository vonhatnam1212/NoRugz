"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Loader2, Wallet, Coins } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLaunchpadAgentService } from "@/services/LaunchpadAgentService";
import { ethers } from "ethers";

export function WalletSettings() {
  const { address, isConnected, isConnecting } = useAccount();
  const launchpadAgentService = useLaunchpadAgentService();
  const [tokenDepositAmount, setTokenDepositAmount] = useState("");
  const [tokenWithdrawAmount, setTokenWithdrawAmount] = useState("");
  const [tokenTwitterHandle, setTokenTwitterHandle] = useState("");
  const [tokenTwitterPlaceholder, setTokenTwitterPlaceholder] =
    useState("@username");
  const [isTokenDepositing, setIsTokenDepositing] = useState(false);
  const [isTokenWithdrawing, setIsTokenWithdrawing] = useState(false);
  const [isTokenRegistering, setIsTokenRegistering] = useState(false);
  const [tokenCredits, setTokenCredits] = useState<string>("0");
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Fetch credits when mounted and address changes
  useEffect(() => {
    let mounted = true;

    const fetchCredits = async () => {
      if (!isMounted || !address) return;

      try {
        const tokenCreds = await launchpadAgentService.getUserTokenCredits(
          address
        );
        console.log("Token credits:", tokenCreds);
        if (mounted) {
          setTokenCredits(ethers.formatEther(tokenCreds));
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        if (mounted) {
          setTokenCredits("0");
        }
      }
    };

    fetchCredits();

    return () => {
      mounted = false;
    };
  }, [address, isMounted, launchpadAgentService]);

  // Add new useEffect to fetch Twitter handle
  useEffect(() => {
    let mounted = true;

    const fetchTwitterHandle = async () => {
      if (!isMounted || !address) return;

      try {
        const handle = await launchpadAgentService.getTwitterHandleByAddress(
          address
        );
        if (mounted) {
          setTokenTwitterPlaceholder("@username");
          if (handle) {
            setTokenTwitterHandle(handle);
            setTokenTwitterPlaceholder(handle);
          }
        }
      } catch (error) {
        console.error("Error fetching twitter handle:", error);
      }
    };

    fetchTwitterHandle();

    return () => {
      mounted = false;
    };
  }, [address, isMounted, launchpadAgentService]);

  // Show loading state during initial hydration or connection
  if (!isMounted || isConnecting) {
    return (
      <div className="space-y-6">
        <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRegisterTokenTwitter = async () => {
    if (!tokenTwitterHandle) {
      toast.error("Please enter a valid Twitter handle");
      return;
    }

    setIsTokenRegistering(true);
    try {
      await launchpadAgentService.registerTwitterHandle(tokenTwitterHandle);
      toast.success(
        `Successfully registered Twitter handle for tokens: ${tokenTwitterHandle}`
      );
      setTokenTwitterHandle("");
    } catch (error: any) {
      console.error("Error registering Twitter handle for tokens:", error);
      toast.error(
        error.message || "Failed to register Twitter handle for tokens"
      );
    } finally {
      setIsTokenRegistering(false);
    }
  };

  const handleTokenDeposit = async () => {
    if (!tokenDepositAmount || parseFloat(tokenDepositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsTokenDepositing(true);
    try {
      const tx = await launchpadAgentService.buyTokenCredits(
        tokenDepositAmount
      );
      toast.success(
        `Successfully deposited ${tokenDepositAmount} S worth of token credits`
      );
      setTokenDepositAmount("");

      // Refresh token credits with cleanup
      const mounted = true;
      try {
        if (address) {
          const credits = await launchpadAgentService.getUserTokenCredits(
            address
          );
          if (mounted) {
            setTokenCredits(ethers.formatEther(credits));
          }
        }
      } catch (error) {
        console.error("Error refreshing token credits:", error);
      }
    } catch (error: any) {
      console.error("Error depositing token funds:", error);
      toast.error(error.message || "Failed to deposit token funds");
    } finally {
      setIsTokenDepositing(false);
    }
  };

  const handleTokenWithdraw = async () => {
    if (!tokenWithdrawAmount || parseFloat(tokenWithdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsTokenWithdrawing(true);
    try {
      const tx = await launchpadAgentService.withdrawCredits(
        tokenWithdrawAmount
      );
      toast.success(
        `Successfully withdrew ${tokenWithdrawAmount} ETH worth of token credits`
      );
      setTokenWithdrawAmount("");

      // Refresh token credits with cleanup
      const mounted = true;
      try {
        if (address) {
          const credits = await launchpadAgentService.getUserTokenCredits(
            address
          );
          if (mounted) {
            setTokenCredits(ethers.formatEther(credits));
          }
        }
      } catch (error) {
        console.error("Error refreshing token credits:", error);
      }
    } catch (error: any) {
      console.error("Error withdrawing token funds:", error);
      toast.error(error.message || "Failed to withdraw token funds");
    } finally {
      setIsTokenWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-retro-green" />
          Token Credits
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage your token credits and wallet connection for NoRugz.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-white/10 bg-black/30 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Coins className="h-5 w-5 text-retro-green" />
              Token Balance
            </CardTitle>
            <CardDescription>
              View and manage your token credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                    <div className="text-sm text-muted-foreground mb-1">
                      Your Token Credits
                    </div>
                    <div className="text-2xl font-bold text-retro-green">
                      {tokenCredits} S
                    </div>
                  </div>

                  <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                    <div className="text-sm text-muted-foreground mb-1">
                      Connected Address
                    </div>
                    <div className="text-2xl font-medium font-mono break-all">
                      {address}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 p-4 bg-black/50 rounded-lg border border-white/10">
                    <div className="text-sm font-medium">Buy Token Credits</div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={tokenDepositAmount}
                        onChange={(e) => setTokenDepositAmount(e.target.value)}
                        className="flex-1 bg-black/50 border-white/20 focus:border-retro-green"
                        min="0"
                        step="0.01"
                        placeholder="Amount in S"
                      />
                      <Button
                        onClick={handleTokenDeposit}
                        disabled={isTokenDepositing}
                        className="whitespace-nowrap bg-retro-green text-black hover:bg-retro-green/80"
                      >
                        {isTokenDepositing && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Buy Credits
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-black/50 rounded-lg border border-white/10">
                    <div className="text-sm font-medium">
                      Withdraw Token Credits
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={tokenWithdrawAmount}
                        onChange={(e) => setTokenWithdrawAmount(e.target.value)}
                        className="flex-1 bg-black/50 border-white/20 focus:border-retro-green"
                        min="0"
                        step="0.01"
                        placeholder="Amount in S"
                      />
                      <Button
                        onClick={handleTokenWithdraw}
                        disabled={isTokenWithdrawing}
                        variant="outline"
                        className="whitespace-nowrap border-retro-green text-retro-green hover:bg-retro-green hover:text-black"
                      >
                        {isTokenWithdrawing && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">
                      Register Twitter Handle for Tokens
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={tokenTwitterHandle}
                        onChange={(e) => setTokenTwitterHandle(e.target.value)}
                        className="flex-1 bg-black/50 border-white/20 focus:border-retro-green"
                        placeholder={tokenTwitterPlaceholder}
                      />
                      <Button
                        onClick={handleRegisterTokenTwitter}
                        disabled={isTokenRegistering}
                        className="whitespace-nowrap bg-retro-green text-black hover:bg-retro-green/80"
                      >
                        {isTokenRegistering && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Register
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-6 text-center">
                <p className="text-muted-foreground">
                  Connect your wallet to manage your token credits and create
                  tokens.
                </p>
                <Button
                  onClick={() => {}}
                  className="bg-retro-green text-black hover:bg-retro-green/80"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}