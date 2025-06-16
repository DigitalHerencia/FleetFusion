/** @format */

import db from "@/lib/database/db"
import { auth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orgId: string }> }
) {
    const { userId } = await auth()
    const { orgId } = await params
    if (!userId) {
        return new Response("Unauthorized", { status: 401 })
    }

    const since = request.nextUrl.searchParams.get("since")
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            controller.enqueue(
                encoder.encode(
                    `data: ${JSON.stringify({
                        type: "connected",
                        timestamp: new Date().toISOString(),
                    })}\n\n`
                )
            )

            const sendUpdates = async () => {
                try {
                    const events = await db.loadStatusEvent.findMany({
                        where: {
                            load: { organizationId: orgId },
                            ...(since
                                ? { timestamp: { gt: new Date(since) } }
                                : {}),
                        },
                        orderBy: { timestamp: "asc" },
                        take: 20,
                    })

                    for (const e of events) {
                        const update = {
                            type: "status_change",
                            data: {
                                loadId: e.loadId,
                                newStatus: e.status,
                                timestamp: e.timestamp,
                            },
                        }
                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify(update)}\n\n`
                            )
                        )
                    }
                } catch (error) {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                type: "error",
                                message: "Failed to fetch updates",
                                timestamp: new Date().toISOString(),
                            })}\n\n`
                        )
                    )
                }
            }

            await sendUpdates()
            const interval = setInterval(sendUpdates, 15000)

            request.signal.addEventListener("abort", () => {
                clearInterval(interval)
                controller.close()
            })
        },
    })

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    })
}
