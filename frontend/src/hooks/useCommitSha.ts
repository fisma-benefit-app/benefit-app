import { useEffect, useState } from "react";
import type { VersionJson } from "../lib/types";

function withTrailingSlash(p: string) {
  return p.endsWith("/") ? p : `${p}/`;
}

export default function useCommitSha(fallback = "-") {
  const [commitSha, setCommitSha] = useState<string>(fallback);

  useEffect(() => {
    const controller = new AbortController();

    const loadVersionJson = async () => {
      try {
        const base =
          (import.meta.env.VITE_BASE_PATH as string | undefined) ??
          import.meta.env.BASE_URL ??
          "/";

        const url = `${withTrailingSlash(base)}version.json`;

        const res = await fetch(url, { cache: "no-store", signal: controller.signal });
        if (!res.ok) {
          setCommitSha(fallback);
          return;
        }

        const data = (await res.json()) as VersionJson;
        setCommitSha(typeof data.sha === "string" && data.sha ? data.sha : fallback);
      } catch {
        setCommitSha(fallback);
      }
    };

    loadVersionJson();
    return () => controller.abort();
  }, [fallback]);

  return commitSha;
}
