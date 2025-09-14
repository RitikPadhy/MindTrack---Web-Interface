export function getApiBase() {
  if (process.env.NODE_ENV === "production") {
    return "http://13.233.212.132:80"; // or your domain like https://api.mindtrack.com
  } else {
    return "http://localhost:8000"; // local backend
  }
}