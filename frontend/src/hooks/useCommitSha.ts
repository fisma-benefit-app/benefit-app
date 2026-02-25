import { useEffect, useState } from "react";
import type { VersionJson } from "../lib/types";

export default function useCommitSha(fallback = "") {
  const [commitSha, setCommitSha] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();

    const loadVersionJson = async () => {
      try {
        const url = new URL("version.json", import.meta.env.BASE_URL).toString();
        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          setCommitSha(fallback);
          return;
        }

        const data = (await res.json()) as VersionJson;

        if (typeof data.sha === "string" && data.sha.length > 0) {
          setCommitSha(data.sha);
        } else {
          setCommitSha(fallback);
        }
      } catch {
        setCommitSha(fallback);
      }
    };

    loadVersionJson();
    return () => controller.abort();
  }, [fallback]);

  return commitSha;
}