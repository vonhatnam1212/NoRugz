"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, Rocket } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Chain, FilterOption } from "./types";
import { cn } from "@/lib/utils";

interface MarketFiltersProps {
  chains: Chain[];
  filterOptions: FilterOption[];
  selectedChain: Chain | null;
  activeFilter: "latest" | "trending" | "new" | "gainers" | "visited";
  onChainSelect: (chain: Chain | null) => void;
  onFilterSelect: (
    filter: "latest" | "trending" | "new" | "gainers" | "visited"
  ) => void;
}

export function MarketFilters({
  chains,
  filterOptions,
  selectedChain,
  activeFilter,
  onChainSelect,
  onFilterSelect,
}: MarketFiltersProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {filterOptions.map((filter) => (
            <Button
              key={filter.id}
              variant="outline"
              size="sm"
              className={cn(
                "border-white/10 hover:border-white/20",
                activeFilter === filter.id && "bg-black/50"
              )}
              onClick={() => onFilterSelect(filter.id)}
            >
              <filter.icon className="w-4 h-4 mr-2" />
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
