import { useState, useCallback } from 'react';
import { currencyConverter } from '@/utils/currencyConverter';
import { CurrencyConversionResult } from '@/types/currency';

export function useCurrencyConverter() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const convert = useCallback(async (
        amount: number,
        fromCurrency: string,
        toCurrency: string
    ): Promise<CurrencyConversionResult | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await currencyConverter.convert(amount, fromCurrency, toCurrency);
            setIsLoading(false);
            return result;
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
            return null;
        }
    }, []);

    return { convert, isLoading, error };
}