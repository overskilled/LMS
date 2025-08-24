"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckIcon, CopyIcon } from 'lucide-react'

interface ReferralCodeDisplayProps {
    referralCode: string
}

export function ReferralCodeDisplay({ referralCode }: ReferralCodeDisplayProps) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000) // Reset "Copied!" message after 2 seconds
        } catch (err) {
            console.error("Failed to copy: ", err)
            // Optionally, provide user feedback that copying failed
        }
    }

    return (
        <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" value={referralCode} readOnly className="font-mono text-white" />
            <Button onClick={handleCopy} disabled={copied} className="shrink-0">
                {copied ? (
                    <>
                        <CheckIcon className="mr-2 h-4 w-4" /> Copied!
                    </>
                ) : (
                    <>
                        <CopyIcon className="mr-2 h-4 w-4" /> Copy
                    </>
                )}
            </Button>
        </div>
    )
}
