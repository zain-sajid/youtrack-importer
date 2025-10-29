import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import { GITHUB_PROVIDER_ID } from "@/lib/constants";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, perPage } = parsePaginationParams(searchParams);

    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accessToken } = await auth.api.getAccessToken({
      body: { providerId: GITHUB_PROVIDER_ID },
      headers: headersList,
    });

    const octokit = new Octokit({ auth: accessToken });

    const userResponse = await octokit.rest.users.getAuthenticated();
    const scopes = parseScopes(userResponse.headers["x-oauth-scopes"]);
    const hasRepoScope = scopes.includes("repo");

    const totalRepos = hasRepoScope
      ? userResponse.data.public_repos +
        (userResponse.data.total_private_repos || 0)
      : userResponse.data.public_repos;

    const reposResponse = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: perPage,
      page: page,
      sort: "updated",
      direction: "desc",
      visibility: hasRepoScope ? "all" : "public",
    });

    return NextResponse.json({
      repos: reposResponse.data,
      totalRepos,
      limitedScope: !hasRepoScope,
      pagination: {
        page,
        perPage,
        hasNextPage: hasNextPageInLink(reposResponse.headers.link),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}

function parsePaginationParams(searchParams: URLSearchParams) {
  return {
    page: parseInt(searchParams.get("page") || String(DEFAULT_PAGE), 10),
    perPage: parseInt(
      searchParams.get("per_page") || String(DEFAULT_PER_PAGE),
      10
    ),
  };
}

function parseScopes(scopeHeader: string | undefined): string[] {
  return scopeHeader?.split(", ") ?? [];
}

function hasNextPageInLink(linkHeader: string | undefined): boolean {
  return linkHeader?.includes('rel="next"') ?? false;
}
