"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";

interface WatchlistStockCardProps {
    symbol: string;
    company: string;
    addedAt: Date;
    logo?: string;
    userEmail?: string;
}

const WatchlistStockCard: React.FC<WatchlistStockCardProps> = ({
    symbol,
    company,
    addedAt,
    logo,
    userEmail,
}) => {
    const [isPending, startTransition] = useTransition();

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date));
    };

    const handleRemoveFromWatchlist = () => {
        if (!userEmail || !symbol) return;

        startTransition(async () => {
            try {
                await removeFromWatchlist(userEmail, symbol);
                // Refresh the page to update the watchlist
                window.location.reload();
            } catch (error) {
                console.error('Failed to remove from watchlist:', error);
            }
        });
    };

    return (
        <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={`/stocks/${symbol}`}
                        className="flex items-center space-x-4 flex-1 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                            {logo ? (
                                <img
                                    src={logo}
                                    alt={`${company} logo`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        // Fallback to star if logo fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.innerHTML = `<div class="w-full h-full bg-yellow-500 rounded-full flex items-center justify-center"><span class="text-black font-bold text-lg">${symbol.charAt(0)}</span></div>`;
                                        }
                                    }}
                                />
                            ) : (
                                <span className="text-yellow-400 font-bold text-lg">
                                    {symbol.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white truncate">
                                {symbol}
                            </h3>
                            <p className="text-gray-400 text-sm truncate">
                                {company}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Added {formatDate(addedAt)}
                            </p>
                        </div>
                    </Link>
                    <div className="ml-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                                    <MoreVertical className="h-4 w-4 text-gray-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem
                                    onClick={handleRemoveFromWatchlist}
                                    disabled={isPending}
                                    className="text-red-400 hover:text-red-300 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {isPending ? 'Removing...' : 'Remove from Watchlist'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default WatchlistStockCard;