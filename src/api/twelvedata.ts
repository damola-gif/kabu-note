
import { TWELVE_DATA_API_KEY } from "@/config";

const BASE_URL = "https://api.twelvedata.com";

// This interface is simplified to what we need for fetching the current price.
interface TwelveDataPrice {
    price: string;
}

// We adapt the return type to match what the dialog expects ({ c: number })
// to avoid having to refactor the form logic.
export async function fetchQuote(symbol: string): Promise<{ c: number }> {
    if (TWELVE_DATA_API_KEY.startsWith('YOUR_')) {
        throw new Error("Twelve Data API key is not configured in src/config.ts");
    }
    const response = await fetch(`${BASE_URL}/price?symbol=${symbol.toUpperCase()}&apikey=${TWELVE_DATA_API_KEY}`);
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Twelve Data API error:", errorText);
        throw new Error("Failed to fetch price from Twelve Data. Check console for details.");
    }
    const data: TwelveDataPrice = await response.json();
    if (!data.price) {
        throw new Error(`Could not fetch price for symbol ${symbol}. It might be an invalid symbol.`);
    }
    return { c: parseFloat(data.price) };
}
