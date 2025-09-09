import axios from "axios";
import currency from "currency.js";

export async function convertXAFtoUSD(amount: number) {
    try {
        // exchangerate.host does NOT require an API key
        const res = await axios.get(
            "https://api.exchangerate.host/latest?base=USD&symbols=XAF"
        );

        console.log(res)
        const xafRate = res.data?.rates?.XAF;
        if (!xafRate) throw new Error("XAF rate not found");

        const rate = 1 / xafRate; // 1 XAF → USD
        return currency(amount).multiply(rate).value;
    } catch (err) {
        console.error("Currency conversion failed, using fallback rate", err);
        const fallbackRate = 0.0017; // static rate
        return currency(amount).multiply(fallbackRate).value;
    }
}
