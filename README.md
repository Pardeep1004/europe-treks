# Europe Treks 🏔️

This is a trekking discovery platform I built to help people find the best hiking trails across Europe. It uses real-time mapping, live location tracking, and even some AI-powered suggestions to help hikers find their next adventure.

**Live Demo**: [europe-treks.vercel.app](https://europe-treks.vercel.app/)

## Why I built this
I wanted to create a tool that felt more modern and responsive than common hiking apps. I focused a lot on the user experience—making sure it looks great on mobile, works fast, and gives users accurate trail data with interactive maps.

## Main Features
*   **Find Trails Near You**: Uses your current location to show trails within a 50km radius.
*   **Interactive Maps**: High-quality maps using Leaflet to show exactly where the trail starts.
*   **Smart Filtering**: You can filter by country, difficulty (Easy/Moderate/Hard), and specific distance ranges.
*   **AI Suggestions**: Integrated with Hugging Face to suggest trails based on what you're looking for.
*   **Reviews & Ratings**: A community system where users can leave feedback and photos of their hikes.

## The Tech Stack
*   **Frontend**: Next.js 15, React 19, and TypeScript.
*   **Styling**: Tailwind CSS (with a custom glassmorphism design).
*   **Database**: Firebase Firestore for real-time data and reviews.
*   **Maps**: Leaflet / React-Leaflet.
*   **AI**: Hugging Face Inference API.
*   **Hosting**: Vercel.

## How to run it locally
If you want to try it out on your machine:

1.  **Clone it**: `git clone https://github.com/Pardeep1004/europe-treks.git`
2.  **Install**: `npm install`
3.  **Environment Variables**: Create a `.env.local` file and add your Firebase and Hugging Face keys (see [QUICKSTART.md](QUICKSTART.md) for the full list).
4.  **Launch**: `npm run dev`

## More Info
*   [🚀 Quick Deployment Guide](QUICKSTART.md) - How to get this live on Vercel.
*   [⚙️ Technical Deep Dive](DEPLOYMENT.md) - Details on security and production optimizations.

---
Built by Pardeep. Feel free to reach out if you have any questions!
