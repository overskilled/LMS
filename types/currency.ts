export interface CurrencyConversionResult {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    convertedAmount: number;
    rate: number;
    timestamp: Date;
}

export interface CurrencyRates {
    [key: string]: number;
}

export interface ConversionOptions {
    baseCurrency?: string;
    cacheDuration?: number; // in milliseconds
    apiKey?: string;
}