export function getApiBase() {
  if (process.env.NODE_ENV === "production") {
    return ""; // relative path in production
  } else {
    return "http://localhost:8000"; // local backend
  }
}