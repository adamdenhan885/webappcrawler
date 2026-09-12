# Data Crawler Hub

Create a modern, clean Web App Dashboard for monitoring an automated AI Data Crawler. The theme should be dark mode-oriented (slate/zinc colors) with professional accents. 

Include the following sections and components:

1. Sidebar Navigation: 

   - Dashboard (Overview)

   - Crawled Data (Table view of HTML & API JSON contents)

   - Bot Logs & Status (Real-time tracking of logs)

   - Configuration / Credentials Manager (Mock settings for login target)

2. Top Stat Cards (Overview Tab):

   - Total Pages Crawled (with a trend indicator)

   - Backend APIs Extracted (number counter)

   - Success Rate Percentage (e.g., 98.4%)

   - AI Tokens Used (Google AI Studio metric tracking)

3. Visual Charts (Using Recharts):

   - A line/area chart showing "Crawling Activity Over Time"

   - A bar chart comparing "Frontend HTML Page Size vs Backend API Payload Size"

4. Interactive Data Table (Crawled Data Tab):

   - Columns: Timestamp, Target URL, Request Type (GET/POST), Status Code (200, 404, etc.), Data Type (Frontend/Backend).

   - Add a clickable "View JSON Data" button inside the table row that opens a sheet/modal to display the mocked raw response body.

5. Actions & Automation Controls:

   - A sticky header with a "Run Crawler Now" button (with a loading spinner state) and a badge showing the current status: "Idle", "Running", or "Failed".

Use beautiful components, clear typography, and ensure the layout is fully responsive. Populate everything with clean, realistic mock data for an analytics/dashboard target.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://webappcrawler.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b40af309-dd67-4949-84eb-401ff2de34aa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
