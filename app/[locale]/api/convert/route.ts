import { NextRequest, NextResponse } from 'next/server';
import { currencyConverter } from '@/utils/currencyConverter';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const amount = parseFloat(searchParams.get('amount') || '1');
    const from = searchParams.get('from') || 'USD';
    const to = searchParams.get('to') || 'EUR';

    try {
        const result = await currencyConverter.convert(amount, from, to);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}