"use client"

import { useCallback, useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"

type Props = {
    href?: string
    label?: string
    communityName?: string
}

export default function WhatsAppFloating({
    href = "https://chat.whatsapp.com/JuiXcG9AqDKCwNpqPnopBw",
    label = "Join our WhatsApp community",
    communityName = "JFN TECHNOVERS",
}: Props) {
    const [open, setOpen] = useState(false)

    const handleOpen = useCallback(() => setOpen(true), [])
    const continueToWhatsApp = useCallback(() => {
        window.open(href, "_blank", "noopener,noreferrer")
        setOpen(false)
    }, [href])

    return (
        <>
            <Button
                size="icon"
                variant="default"
                onClick={handleOpen}
                className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1EBE5C] focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                aria-label={label}
            >
                <MessageCircle className="h-7 w-7" aria-hidden="true" />
                <span className="sr-only">{label}</span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Leaving this site</DialogTitle>
                        <DialogDescription>
                            {"You'll be redirected to "}
                            <span className="font-medium">{communityName}</span>
                            {" on WhatsApp."}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={continueToWhatsApp} className="bg-[#25D366] hover:bg-[#1EBE5C] text-white">
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
