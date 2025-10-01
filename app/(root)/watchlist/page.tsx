import WatchlistStockCard from "@/components/WatchlistStockCard";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { getWatchlistItemsByEmail } from "@/lib/actions/watchlist.actions";
import { getStockProfile } from "@/lib/actions/finnhub.actions";

export default async function WatchlistPage() {

    // Get user session and watchlist items
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const user = session?.user;
    const watchlistItems = user?.email ? await getWatchlistItemsByEmail(user.email) : [];

    // Fetch profiles for each watchlist item to get logos
    const watchlistItemsWithLogos = await Promise.all(
        watchlistItems.map(async (item) => {
            const profile = await getStockProfile(item.symbol);
            return {
                ...item,
                logo: profile?.logo,
            };
        })
    );

    return (
        <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
            <div className="w-full space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
                    <div className="text-sm text-gray-400">
                        {watchlistItemsWithLogos.length} {watchlistItemsWithLogos.length === 1 ? 'stock' : 'stocks'}
                    </div>
                </div>

                {watchlistItemsWithLogos.length === 0 ? (
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <svg
                                className="h-16 w-16 text-gray-400 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                            </svg>
                            <CardTitle className="text-xl text-gray-300 mb-2">
                                No stocks in your watchlist
                            </CardTitle>
                            <CardDescription className="text-center max-w-md">
                                Add stocks to your watchlist by clicking the star icon on individual stock pages.
                                Your watchlist stocks will appear here for quick access.
                            </CardDescription>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {watchlistItemsWithLogos.map((item) => (
                            <WatchlistStockCard
                                key={item.symbol}
                                symbol={item.symbol}
                                company={item.company}
                                addedAt={item.addedAt}
                                logo={item.logo}
                                userEmail={user?.email}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
