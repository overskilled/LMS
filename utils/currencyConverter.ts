import { ConversionOptions, CurrencyConversionResult, CurrencyRates } from '@/types/currency';
import axios from 'axios';

const DEFAULT_BASE_CURRENCY = 'USD';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest';

// In-memory cache (for server-side, use Redis in production)
let ratesCache: { [key: string]: { rates: any; timestamp: number } } = {};

export class CurrencyConverter {
    private apiKey: string;
    private baseCurrency: string;
    private cacheDuration: number;

    constructor(options: ConversionOptions = {}) {
        this.baseCurrency = options.baseCurrency || DEFAULT_BASE_CURRENCY;
        this.cacheDuration = options.cacheDuration || DEFAULT_CACHE_DURATION;
        this.apiKey = options.apiKey || '';
    }

    async convert(
        amount: number,
        fromCurrency: string,
        toCurrency: string
    ): Promise<CurrencyConversionResult> {
        fromCurrency = fromCurrency.toUpperCase();
        toCurrency = toCurrency.toUpperCase();

        if (fromCurrency === toCurrency) {
            return {
                amount,
                fromCurrency,
                toCurrency,
                convertedAmount: amount,
                rate: 1,
                timestamp: new Date()
            };
        }

        const rates = await this.getExchangeRates(fromCurrency);
        const rate = this.getConversionRate(rates, fromCurrency, toCurrency);

        const convertedAmount = amount * rate;

        return {
            amount,
            fromCurrency,
            toCurrency,
            convertedAmount: this.roundToDecimal(convertedAmount, 2),
            rate: this.roundToDecimal(rate, 6),
            timestamp: new Date()
        };
    }

    private async getExchangeRates(baseCurrency: string): Promise<CurrencyRates> {
        const cacheKey = baseCurrency;
        const now = Date.now();

        // Check cache first
        if (ratesCache[cacheKey] && now - ratesCache[cacheKey].timestamp < this.cacheDuration) {
            return ratesCache[cacheKey].rates;
        }

        try {
            const response = await axios.get(`${EXCHANGE_RATE_API}/${baseCurrency}`);
            const rates = response.data.rates;

            // Update cache
            ratesCache[cacheKey] = {
                rates,
                timestamp: now
            };

            return rates;
        } catch (error: any) {
            throw new Error(`Failed to fetch exchange rates: ${error.message}`);
        }
    }

    private getConversionRate(rates: CurrencyRates, from: string, to: string): number {
        // If converting from base currency
        if (from === this.baseCurrency) {
            return rates[to] || 1;
        }

        // If converting to base currency
        if (to === this.baseCurrency) {
            return 1 / (rates[from] || 1);
        }

        // Cross conversion through base currency
        const fromRate = rates[from] || 1;
        const toRate = rates[to] || 1;
        return toRate / fromRate;
    }

    private roundToDecimal(value: number, decimals: number): number {
        return Number(value.toFixed(decimals));
    }

    // Clear cache manually if needed
    clearCache(): void {
        ratesCache = {};
    }
}

// Singleton instance for easy use
export const currencyConverter = new CurrencyConverter();

// Utility function for one-off conversions
export async function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    options?: ConversionOptions
): Promise<CurrencyConversionResult> {
    const converter = new CurrencyConverter(options || {});
    return converter.convert(amount, fromCurrency, toCurrency);
}