import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Octokit } from "octokit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "10", 10);

    const headersList = await headers();

    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accessToken } = await auth.api.getAccessToken({
      body: {
        providerId: "github",
        userId: session.user.id,
      },
      headers: headersList,
    });

    const octokit = new Octokit({
      auth: accessToken,
    });

    const [response, userResponse] = await Promise.all([
      octokit.rest.repos.listForAuthenticatedUser({
        per_page: perPage,
        page: page,
        sort: "updated",
        direction: "desc",
      }),
      octokit.rest.users.getAuthenticated(),
    ]);

    const repos = response.data;
    const totalRepos =
      userResponse.data.public_repos +
      (userResponse.data.total_private_repos || 0);

    const linkHeader = response.headers.link;

    let hasNextPage = false;
    let hasPrevPage = page > 1;

    if (linkHeader) {
      hasNextPage = linkHeader.includes('rel="next"');
    }

    return NextResponse.json({
      repos,
      totalRepos,
      pagination: {
        page,
        perPage,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch repos" },
      { status: 500 }
    );
  }
}
