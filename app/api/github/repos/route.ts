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
      },
      headers: headersList,
    });

    const octokit = new Octokit({
      auth: accessToken,
    });

    const userResponse = await octokit.rest.users.getAuthenticated();
    const scopes = userResponse.headers["x-oauth-scopes"];
    const scopeArray = scopes ? scopes.split(", ") : [];
    const hasRepoScope = scopeArray.includes("repo");

    const response = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: perPage,
      page: page,
      sort: "updated",
      direction: "desc",
      visibility: hasRepoScope ? "all" : "public",
    });

    const repos = response.data;
    const totalRepos = hasRepoScope
      ? userResponse.data.public_repos +
        (userResponse.data.total_private_repos || 0)
      : userResponse.data.public_repos;

    const linkHeader = response.headers.link;

    let hasNextPage = false;
    let hasPrevPage = page > 1;

    if (linkHeader) {
      hasNextPage = linkHeader.includes('rel="next"');
    }

    return NextResponse.json({
      repos,
      totalRepos,
      limitedScope: !hasRepoScope,
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
