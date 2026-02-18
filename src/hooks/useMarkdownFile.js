import { useEffect, useState } from "react";

export default function useMarkdownFile(filePath) {
  const [state, setState] = useState({
    content: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadMarkdown() {
      setState({ content: "", loading: true, error: null });

      try {
        const response = await fetch(filePath, {
          headers: { Accept: "text/markdown,text/plain" },
        });

        if (!response.ok) {
          throw new Error(`문서를 불러오지 못했습니다: ${response.status}`);
        }

        const markdown = await response.text();

        if (!isCancelled) {
          setState({ content: markdown, loading: false, error: null });
        }
      } catch (error) {
        if (!isCancelled) {
          setState({ content: "", loading: false, error });
        }
      }
    }

    if (filePath) {
      loadMarkdown();
    }

    return () => {
      isCancelled = true;
    };
  }, [filePath]);

  return state;
}
