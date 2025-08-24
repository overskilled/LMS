"use client"

import { useState, useTransition } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useChangeLocale, useCurrentLocale } from '@/locales/client';

type Language = {
    code: string;
    name: string;
    flag: string;
};

const languages: Language[] = [
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w20/gb.png' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w20/fr.png' },
];

const LanguageSelector = () => {
    const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

    const changeLocale = useChangeLocale()
    const locale = useCurrentLocale()

    const router = useRouter()

    const onLanguageChange = (item: Language) => {
        if (item.code == "en") {
            changeLocale('en')
        } else {
            changeLocale('fr')
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    {locale === "en" ?
                        (
                            <>
                                {/* <img
                                    src={languages[0].flag}
                                    alt={languages[0].name}
                                    className="h-5 w-7"
                                /> */}
                                <span>
                                    {languages[0].name.slice(0, 2).toUpperCase()}
                                </span>
                            </>
                        )
                        : (
                            <>
                                <span>
                                    {languages[1].name.slice(0, 2).toUpperCase()}
                                </span>

                            </>
                        )
                    }
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {languages.map((lang) => (
                    <DropdownMenuItem key={lang.code} onSelect={() => onLanguageChange(lang)}>
                        <img src={lang.flag} alt={lang.name} className="h-4 w-6 mr-2" />
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSelector;
