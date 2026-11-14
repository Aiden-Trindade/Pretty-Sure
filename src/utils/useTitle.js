import { useEffect } from "react";

// Sets the browser tab's title for the page you're on: "Stats · Pretty Sure"
export default function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Pretty Sure` : "Pretty Sure";
  }, [title]);
}
