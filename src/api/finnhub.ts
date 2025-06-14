
import { FINNHUB_API_KEY } from "@/config";

const BASE_URL = "https://finnhub.io/api/v1";

interface FinnhubQuote {
    c: number; // current price
    d: number; // change
    dp: number; // percent change
    h: number; // high price of the day
    l: number; // low price of the day
    o: number; // open price of the day
    pc: number; // previous close price
}

export async function fetchQuote(symbol: string): Promise<FinnhubQuote> {
    if (FINNHUB_API_KEY === 'YOUR_FINNHUB_API_KEY') {
        throw new Error("Finnhub API key is not configured in src/config.ts");
    }
    const response = await fetch(`${BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${FINNHUB_API_KEY}`);
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Finnhub API error:", errorText);
        throw new Error("Failed to fetch quote from Finnhub. Check console for details.");
    }
    return response.json();
}
