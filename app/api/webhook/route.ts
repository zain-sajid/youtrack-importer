import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log("Webhook received:", {
      timestamp: new Date().toISOString(),
      payload,
    });

    // You can add your webhook processing logic here
    // For example: forward to backend, validate signature, etc.

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
