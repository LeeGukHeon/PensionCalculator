import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useMarkdownFile from "../hooks/useMarkdownFile";
import useDocumentMeta from "../hooks/useDocumentMeta";
import { SITE_URL } from "../constants/site";

const PolicyPage = ({ title, description, contentPath }) => {
  const { content, loading, error } = useMarkdownFile(contentPath);

  useDocumentMeta({
    title: `${title} | 연금계산기`,
    description,
    canonical: `${SITE_URL}${window.location.pathname}`,
  });

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white my-10 rounded-2xl shadow-sm border border-slate-200">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">{title}</h1>
      {loading && <p className="text-slate-500">문서를 불러오는 중입니다...</p>}
      {error && (
        <p className="text-red-500">
          문서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      )}
      {!loading && !error && (
        <article className="prose prose-slate max-w-none text-sm md:text-base">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      )}
    </div>
  );
};

export default PolicyPage;
