import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const youtrackBaseUrl = process.env.YOUTRACK_BASE_URL;
    const youtrackToken = process.env.YOUTRACK_ACCESS_TOKEN;

    if (!youtrackBaseUrl || !youtrackToken) {
      return NextResponse.json(
        { error: "YouTrack configuration is missing" },
        { status: 500 }
      );
    }

    const response = await axios.get(
      `${youtrackBaseUrl}/api/admin/projects?fields=id,name,shortName`,
      {
        headers: {
          Authorization: `Bearer ${youtrackToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching YouTrack projects:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch YouTrack projects",
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
