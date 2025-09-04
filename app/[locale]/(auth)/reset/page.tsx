"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useI18n } from "@/locales/client"; // Import the useI18n hook
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const Page = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const t = useI18n();

    const router = useRouter()



    const sendResetEmail = async () => {
        if (!email) {
            toast.error(t("resetPassword.enterValidEmail")); // Translated text
            return;
        }

        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            toast.success(t("resetPassword.resetLinkSent")); // Translated text
        } catch (error: any) {
            toast.error(t("resetPassword.errorOccurred", { message: error.message }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex w-full justify-center items-center w-[100%] h-[100vh]'>
            <div className='flex flex-col justify-center items-center w-[50%] space-y-4 text-center'>
                <h3 className='text-3xl text-bold'>{t("resetPassword.resetPasswordTitle")}</h3> {/* Translated text */}
                <p>{t("resetPassword.resetPasswordDescription")}</p> {/* Translated text */}
                <Input
                    placeholder={t("resetPassword.emailPlaceholder")} // Translated text
                    name='reset-email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                    className="bg-blue-500 hover:bg-blue-500"
                    onClick={sendResetEmail}
                >
                    {loading ? <><Loader2 className="animate-spin mr-2" /> Sending...</> : t("resetPassword.submitButton")}
                </Button>

                <Button variant={"outline"} onClick={() => router.push('login')}>
                    {t("hero.loginAgain")}
                </Button>
            </div>
        </div>
    );
};

export default Page;