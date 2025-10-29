# YouTrack Importer

A web application that seamlessly imports GitHub issues into YouTrack projects. Built with Next.js, this tool provides an intuitive interface for migrating your issue tracking from GitHub to YouTrack.

<img width="1368" height="691" alt="CleanShot 2025-10-29 at 13 22 49" src="https://github.com/user-attachments/assets/b913c89e-9f1e-4170-904e-2f84f9edcdb7" />

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database
- **GitHub OAuth App** credentials
- **YouTrack instance** with API access

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd youtrack-importer
```

### 2. Set Up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: YouTrack Importer
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Save the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory from the `.env.example` file.

**Generate `BETTER_AUTH_SECRET`**:

```bash
openssl rand -base64 32
```

**Get YouTrack Token**:

1. Go to your YouTrack instance
2. Navigate to Users → Account Security → New Token
3. Create a permanent token with appropriate permissions

### 4. Set Up the Database

Create a PostgreSQL database and add the database URL to the env file.

Create Better Auth authentication tables by running the migration using:

```bash
npx @better-auth/cli migrate
```

### 5. Install Dependencies

```bash
# Install frontend dependencies
npm install
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Set Up GitHub Webhooks (Need to sync issues with YouTrack)

For local testing, follow the [GitHub webhook testing guide](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/testing-webhooks#testing-webhook-code-locally) using [smee.io](https://smee.io/).

Quick setup:

1. Get a webhook proxy URL from [smee.io](https://smee.io/)
2. Install smee client: `npm install --global smee-client`
3. Configure webhook in your GitHub repo with the smee.io URL
4. Start forwarding: `smee --url YOUR_SMEE_URL --path /api/webhook --port 3000`

For production, use your actual domain URL (e.g., `https://yourdomain.com/api/webhook`).

## Overview

YouTrack Importer allows you to:

- **Authenticate** with GitHub using OAuth using BetterAuth
- **Browse** your GitHub repositories with pagination
- **Select** a target YouTrack project
- **Import** all issues from a GitHub repository to YouTrack
- **Track** import progress in real-time

## How It Works

1. **Sign In**: Users authenticate with their GitHub account
2. **Select Repository**: Browse and select a GitHub repository from your repos (additional permission needed for private repos)
3. **Choose YouTrack Project**: Select the destination YouTrack project from a dropdown
4. **Import**: Click "Import Issues" to start the migration process
5. **Webhooks**: Automatically sync your GitHub issues with YouTrack issues

Important: Only issues with `youtrack` labels are synced with YouTrack issues.

## Architecture

- **Frontend**: Next.js 16 with React 19, TypeScript, and Tailwind CSS
- **Authentication**: Better Auth with GitHub OAuth provider
- **Database**: PostgreSQL (for authentication sessions)
- **APIs**: GitHub REST API (via Octokit) and YouTrack REST API

## Technologies Used

- [Next.js 16](https://nextjs.org/) - React framework
- [Better Auth](https://better-auth.vercel.app/) - Authentication
- [Octokit](https://github.com/octokit/octokit.js) - GitHub API client
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components
- [SWR](https://swr.vercel.app/) - Data fetching
- [PostgreSQL](https://www.postgresql.org/) - Database
