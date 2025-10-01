'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
}

export async function getWatchlistItemsByEmail(email: string): Promise<{ symbol: string; company: string; addedAt: Date }[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1, company: 1, addedAt: 1 }).lean();
        return items.map((i) => ({
            symbol: String(i.symbol),
            company: String(i.company),
            addedAt: i.addedAt
        }));
    } catch (err) {
        console.error('getWatchlistItemsByEmail error:', err);
        return [];
    }
}

export async function isStockInWatchlist(email: string, symbol: string): Promise<boolean> {
    if (!email || !symbol) return false;

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return false;

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return false;

        const item = await Watchlist.findOne({ userId, symbol: symbol.toUpperCase() }).lean();
        return !!item;
    } catch (err) {
        console.error('isStockInWatchlist error:', err);
        return false;
    }
}

export async function addToWatchlist(email: string, symbol: string, company: string): Promise<boolean> {
    if (!email || !symbol || !company) return false;

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return false;

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return false;

        await Watchlist.findOneAndUpdate(
            { userId, symbol: symbol.toUpperCase() },
            { userId, symbol: symbol.toUpperCase(), company, addedAt: new Date() },
            { upsert: true, new: true }
        );

        return true;
    } catch (err) {
        console.error('addToWatchlist error:', err);
        return false;
    }
}

export async function removeFromWatchlist(email: string, symbol: string): Promise<boolean> {
    if (!email || !symbol) return false;

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return false;

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return false;

        await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });
        return true;
    } catch (err) {
        console.error('removeFromWatchlist error:', err);
        return false;
    }
}