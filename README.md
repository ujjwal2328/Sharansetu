This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🏗️ Prototype Architecture & Data Sources (SIH Judges Note)

This project is a functional prototype built for **SIH Problem Statement 69**. It is designed with a scalable architecture, although this specific deployment uses simulated data for demonstration purposes.

### Architecture Flow
```
[External APIs]      [Next.js Backend]      [Evacuation Engine]       [React Dashboard]
IMD Weather      →                      →  Multi-factor Scoring  →   Leaflet GIS Map
NRSC Flood Maps  →   Node.js API Route  →  OSRM Route Validation →   Explainable AI Cards
NDMA Shelters    →                      →  Capacity Tracking     →   Real-time Panels
```

### Data Sources
* **Current Prototype**: Uses simulated data (`mockData.ts`) for Raipur urban flood scenarios.
* **Production Vision**: The architecture is built to seamlessly swap out the mock data layer with live API endpoints from Indian Meteorological Department (IMD), National Remote Sensing Centre (NRSC), and local municipal shelter databases.
