import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(
                new URL("/enterprise/sign-in?error=missing-token", req.url)
            );
        }

        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken) {
            return NextResponse.redirect(
                new URL("/enterprise/sign-in?error=invalid-token", req.url)
            );
        }

        if (verificationToken.expires < new Date()) {
            await prisma.verificationToken.delete({
                where: { token },
            });

            return NextResponse.redirect(
                new URL("/enterprise/sign-in?error=token-expired", req.url)
            );
        }

        await prisma.utilisateur.update({
            where: { email: verificationToken.identifier },
            data: {
                emailVerified: new Date(),
            },
        });

        await prisma.verificationToken.delete({
            where: { token },
        });

        return NextResponse.redirect(
            new URL("/enterprise/sign-in?verified=true", req.url)
        );
    } catch (error) {
        console.error("Verify email error:", error);
        return NextResponse.redirect(
        new URL("/worker/sign-in?error=server-error", req.url)
        );
    }
}
