"use client";
import React, { useMemo, useState, useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions";

// Minimal WatchlistButton implementation to satisfy page requirements.
// This component focuses on UI contract only. It toggles local state and
// calls onWatchlistChange if provided. Styling hooks match globals.css.

const WatchlistButton = ({
    symbol,
    company,
    isInWatchlist,
    showTrashIcon = false,
    type = "button",
    size = "default",
    userEmail,
    onWatchlistChange,
}: {
    symbol: string;
    company?: string;
    isInWatchlist?: boolean;
    showTrashIcon?: boolean;
    type?: "button" | "icon";
    size?: "xs" | "sm" | "default";
    userEmail?: string;
    onWatchlistChange?: (symbol: string, added: boolean) => void;
}) => {
    const [added, setAdded] = useState<boolean>(!!isInWatchlist);
    const [isPending, startTransition] = useTransition();

    const label = useMemo(() => {
        if (type === "icon") return "";
        return added ? "Remove from Watchlist" : "Add to Watchlist";
    }, [added, type]);

    const handleClick = () => {
        if (!userEmail || !symbol || !company) return;

        const next = !added;

        // Optimistic update
        setAdded(next);
        onWatchlistChange?.(symbol, next);

        startTransition(async () => {
            try {
                const success = next
                    ? await addToWatchlist(userEmail, symbol, company)
                    : await removeFromWatchlist(userEmail, symbol);

                if (!success) {
                    // Revert optimistic update on failure
                    setAdded(!next);
                    onWatchlistChange?.(symbol, !next);
                }
            } catch (error) {
                console.error('Watchlist action failed:', error);
                // Revert optimistic update on error
                setAdded(!next);
                onWatchlistChange?.(symbol, !next);
            }
        });
    };

    if (type === "icon") {
        return (
            <button
                title={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
                aria-label={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
                className={`watchlist-icon-btn ${added ? "watchlist-icon-added" : ""}`}
                onClick={handleClick}
                disabled={isPending || !userEmail}
            >
                {isPending ? (
                    <svg className={`animate-spin ${size === "xs" ? "h-3 w-3" : size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={added ? "#FACC15" : "none"}
                        stroke="#FACC15"
                        strokeWidth="1.5"
                        className={`watchlist-star ${size === "xs" ? "h-3 w-3" : size === "sm" ? "h-4 w-4" : "h-5 w-5"}`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                        />
                    </svg>
                )}
            </button>
        );
    }

    return (
        <button
            className={`watchlist-btn ${added ? "watchlist-remove" : ""}`}
            onClick={handleClick}
            disabled={isPending || !userEmail}
        >
            {isPending ? (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : showTrashIcon && added ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6" />
                </svg>
            ) : null}
            <span>{isPending ? "Updating..." : label}</span>
        </button>
    );
};

export default WatchlistButton;