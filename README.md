# GSC Reportify

## Description

GSC Reportify is a web application that allows users to generate reports from Google Search Console data, enhanced with insights from Google's Gemini AI. Users can create custom reports by dragging and dropping metrics into a table, fetch data from Google Search Console, and export the results.

## Tech Stack

-   Next.js: A React framework for building server-rendered web applications with a file-based routing system.
-   TypeScript: A superset of JavaScript that adds static typing for better code reliability and maintainability.
-   Tailwind CSS: A utility-first CSS framework for rapid UI development with customizable classes.
-   Prisma: A modern database toolkit for TypeScript and Node.js, used as an ORM to interact with MongoDB.
-   MongoDB: A NoSQL database for storing user data, reports, and configurations.
-   Google APIs (googleapis): Used to interact with Google Search Console for fetching performance data (e.g., clicks, impressions, CTR, position). The googleapis library handles OAuth2 authentication server-side, where users authenticate via Clerk's custom Google OAuth flow. The app then uses the Search Console API to fetch query data based on selected metrics and time ranges, which is processed and displayed in a table.
-   Gemini AI: Integrated via the Gemini API to provide AI-driven insights on the fetched Google Search Console data.
-   Clerk: Handles authentication and user management, supporting custom Google OAuth for Google Search Console access.
-   @dnd-kit/core: A lightweight drag-and-drop library used for implementing drag-and-drop functionality. In GSC Reportify, @dnd-kit/core enables users to drag metrics from a sidebar (MetricsSidebar.tsx) and drop them into the report table (ReportTable.tsx). The library's useDraggable and useDroppable hooks are used to manage draggable metric blocks and droppable table columns, respectively, allowing dynamic report customization.

## Setup Instructions

### Prerequisites

-   Node.js (version >= 18)
-   npm or yarn
-   MongoDB account
-   Google Cloud Console account (for Google Search Console API access)
-   Clerk account

### Installation

1.  **Clone the Repository:**

    ```bash
    git clone <repository_url>
    cd gsc-reportify
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set Up Environment Variables:**

    Create a `.env.local` file in the root directory.

    Add the following environment variables:

    ```
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
    CLERK_SECRET_KEY=<your_clerk_secret_key>
    NEXT_PUBLIC_GEMINI_API_KEY=<your_gemini_api_key>
    CLERK_WEBHOOK_SIGNING_SECRET=<your_clerk_webhook_signing_secret>
    ```

    Also, ensure you have a `.env` file with the MongoDB connection string:

    ```
    DATABASE_URL="mongodb+srv://<username>:<password>@<cluster_url>/<database_name>?retryWrites=true&w=majority&appName=GCS-Reportify"
    ```

    Replace the placeholder values with your actual API keys and database credentials.

4.  **Set Up the Database:**

    Ensure you have a MongoDB database set up.

    Update the `DATABASE_URL` in the `.env` file with your MongoDB connection string.

    Sync the database schema and generate Prisma client:

    ```bash
    npx prisma db push
    npx prisma generate
    ```

5.  **Start the Development Server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

## API Keys

-   **Clerk:** Create a Clerk account and obtain the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `CLERK_WEBHOOK_SIGNING_SECRET`. Refer to the [Clerk documentation](https://clerk.com/docs) for more information.
-   **Gemini API:** Obtain a Gemini API key from Google. Refer to the [Gemini API documentation](https://ai.google.dev/) for more information.

## Google Search Console Authentication

To fetch data from Google Search Console, the application uses the `googleapis` library. The authentication flow is as follows:

### Clerk Custom Google OAuth:

1.  In your Clerk dashboard, enable custom Google authentication:
    -   Go to "SSO Connections" and add a new Google provider.
    -   Provide your Google Client ID and Client Secret (obtained from the Google Cloud Console).
    -   Select the Webmaster Readonly scope (`https://www.googleapis.com/auth/webmasters.readonly`) to allow read-only access to Google Search Console data.

This allows users to sign in via Google and grant the necessary permissions for the app to access their Google Search Console data.

### Server-Side Authentication:

-   The app uses the `googleapis` library to authenticate requests to the Google Search Console API using the OAuth2 tokens obtained via Clerk.
-   The tokens are used to fetch performance data (e.g., queries, clicks, impressions) based on the user-selected metrics and time ranges.

## Clerk Webhooks

The application uses Clerk webhooks to handle user-related events (e.g., user creation, updates). Configure the webhook endpoint in your Clerk dashboard:

1.  Go to the "Webhooks" section in the Clerk dashboard.
2.  Add a new webhook pointing to your app's webhook endpoint (e.g., `<website_url>/api/webhook/`).
3.  Provide the `CLERK_WEBHOOK_SIGNING_SECRET` in your `.env.local` file to verify the webhook signature.

**Note:** The Webhook Will Not Work in Localhost, So Deploy Your Website First and then replace `<website_url>` with your actual website URL.

You Can Checkout More On:- [https://clerk.com/docs/webhooks/sync-data](https://clerk.com/docs/webhooks/sync-data)

## Drag-and-Drop Implementation

GSC Reportify uses `@dnd-kit/core` to implement drag-and-drop functionality for building reports:

-   **Metrics Sidebar:** The `MetricsSidebar.tsx` component renders a list of draggable metric blocks (e.g., clicks, impressions). Each block uses the `useDraggable` hook to make it draggable.
-   **Report Table:** The `ReportTable.tsx` component defines droppable areas (table columns and the + column) using the `useDroppable` hook. Users can drop metrics into columns to add them to the report or drop on the + column to add a new column with the metric.
-   **State Management:** The drag-and-drop actions update the report configuration via a context (`report-config-context.ts`), ensuring the table reflects the user's selections.

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

MIT
