import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import path from "path";
import fs from "fs";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
    function drawWrappedText({
        page,
        text,
        x,
        y,
        font,
        size,
        maxWidth,
        lineHeight = 16,
        bottomMargin = 50,
    }: {
        page: any;
        text: string;
        x: number;
        y: number;
        font: any;
        size: number;
        maxWidth: number;
        lineHeight?: number;
        bottomMargin?: number;
    }) {
        const words = text.split(" ");
        let line = "";
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const newLine = line ? `${line} ${word}` : word;
            const width = font.widthOfTextAtSize(newLine, size);

            if (width > maxWidth) {
                if (currentY - lineHeight < bottomMargin) break;
                page.drawText(line, { x, y: currentY, size, font });
                currentY -= lineHeight;
                line = word;
            } else {
                line = newLine;
            }
        }

        if (line && currentY - lineHeight >= bottomMargin) {
            page.drawText(line, { x, y: currentY, size, font });
        }
    }

    try {
        const { user, course, transaction } = await req.json();

        if (!user || !course || !transaction) {
            return NextResponse.json(
                { error: "Missing required data" },
                { status: 400 }
            );
        }

        // --- Create PDF ---
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 500]);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const { width, height } = page.getSize();

        // --- Header: Payment receipt + logo ---
        const title = "Payment Receipt";
        const titleSize = 22;
        const titleWidth = helveticaBold.widthOfTextAtSize(title, titleSize);

        page.drawText(title, {
            x: 50,
            y: height - 70,
            size: titleSize,
            font: helveticaBold,
            color: rgb(0.1, 0.1, 0.1),
        });

        const logoPath = path.join(process.cwd(), "public", "nmd-logo.png");
        const logoImageBytes = fs.readFileSync(logoPath);
        const logoImage = await pdfDoc.embedPng(logoImageBytes);
        const logoDims = logoImage.scale(0.15);

        page.drawImage(logoImage, {
            x: width - logoDims.width - 50,
            y: height - logoDims.height - 30,
            width: logoDims.width,
            height: logoDims.height,
        });

        // Line under header
        page.drawLine({
            start: { x: 50, y: height - 90 },
            end: { x: width - 50, y: height - 90 },
            thickness: 1,
            color: rgb(0.8, 0.8, 0.8),
        });

        // --- Transaction Info ---
        const infoY = height - 130;
        page.drawText(`ID: ${transaction.id}`, {
            x: 50,
            y: infoY,
            size: 12,
            font: helvetica,
        });
        page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
            x: 50,
            y: infoY - 20,
            size: 12,
            font: helvetica,
        });

        // --- User Info ---
        page.drawText(`To: ${user.name}`, {
            x: 50,
            y: infoY - 60,
            size: 12,
            font: helvetica,
        });
        page.drawText(`${user.email}`, {
            x: 50,
            y: infoY - 80,
            size: 12,
            font: helvetica,
        });

        // --- Course Info ---
        drawWrappedText({
            page,
            text: `Course: ${course.title}`,
            x: 50,
            y: infoY - 120,
            font: helvetica,
            size: 12,
            maxWidth: 500,
        });

        // --- Price (highlighted) ---
        const priceLabel = "Total Paid: ";
        const priceValue = `${course.amount} ${course.currency}`;
        const labelWidth = helvetica.widthOfTextAtSize(priceLabel, 14);

        page.drawText(priceLabel, {
            x: 50,
            y: infoY - 180,
            size: 14,
            font: helvetica,
            color: rgb(0, 0, 0),
        });

        page.drawText(priceValue, {
            x: 50 + labelWidth,
            y: infoY - 180,
            size: 16,
            font: helveticaBold,
            color: rgb(0.2, 0.4, 0.7), // blue highlight
        });

        // Line above footer
        page.drawLine({
            start: { x: 50, y: 80 },
            end: { x: width - 50, y: 80 },
            thickness: 1,
            color: rgb(0.8, 0.8, 0.8),
        });

        // --- Footer (centered thank you) ---
        const footerText = "Thank you for your purchase!";
        const footerWidth = helvetica.widthOfTextAtSize(footerText, 12);

        page.drawText(footerText, {
            x: width / 2 - footerWidth / 2,
            y: 50,
            size: 12,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3),
        });

        // --- Save PDF ---
        const pdfBytes = await pdfDoc.save();
        const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

        // --- Send email ---
        await resend.emails.send({
            from: "Learning - Nanosatellite Missions Design <no-reply@nanosatellitemissions.com>",
            to: user.email,
            subject: `Invoice for ${course.title}`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color:#2E86C1;">Thank you for your purchase, ${user.name}!</h2>
          <p>You have successfully enrolled in <strong>${course.title}</strong>.</p>
          <p>Attached is your payment receipt for reference.</p>
          <br/>
          <p style="font-size:14px; color:#777;">Best regards,<br/>Nanosatellite Missions Design Team</p>
        </div>
      `,
            attachments: [
                {
                    filename: `invoice-${transaction.id}.pdf`,
                    content: pdfBase64,
                },
            ],
        });

        return NextResponse.json({ success: true, message: "Invoice sent" });
    } catch (error) {
        console.error("Error sending invoice:", error);
        return NextResponse.json(
            { error: "Failed to send invoice" },
            { status: 500 }
        );
    }
}
