"use client";

import { useCallback, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { useI18n } from "@/locales/client";

export type WhatsAppFloatingProps = {
    /** Link to your WhatsApp group or chat */
    href?: string;
    /** Button accessible label */
    label?: string;
    /** Name of the community for the dialog message */
    communityName?: string;
};

export default function WhatsAppFloating({
    href = "https://chat.whatsapp.com/FEeas0ZegOIGLHxnRqXo04",
    label,
    communityName = "JFN TECHNOVERS",
}: WhatsAppFloatingProps) {
    const [open, setOpen] = useState(false);
    const t = useI18n();

    const handleOpen = useCallback(() => setOpen(true), []);
    const continueToWhatsApp = useCallback(() => {
        if (href) {
            window.open(href, "_blank", "noopener,noreferrer");
        }
        setOpen(false);
    }, [href]);

    return (
        <>
            <Button
                onClick={handleOpen}
                className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-lg hover:bg-[#1EBE5C] focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                aria-label={label || t("whatsapp.buttonLabel")}
            >
                <MessageCircle className="h-6 w-6" aria-hidden="true" />
                <span className="font-medium">
                    {label || t("whatsapp.buttonLabel")}
                </span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("whatsapp.dialog.title")}</DialogTitle>
                        <DialogDescription>
                            {t("whatsapp.dialog.description.before")}{" "}
                            <span className="font-medium">{communityName}</span>{" "}
                            {t("whatsapp.dialog.description.after")}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">{t("whatsapp.cancel")}</Button>
                        </DialogClose>
                        <Button
                            onClick={continueToWhatsApp}
                            className="bg-[#25D366] hover:bg-[#1EBE5C] text-white"
                        >
                            {t("whatsapp.continue")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
