export function getApiBase() {
  if (process.env.NODE_ENV === "production") {
    return "https://mind-track-web-interface.vercel.app/api"; // backend serverless endpoint
  } else {
    return "http://localhost:8000"; // local dev if testing FastAPI locally
  }
}