import React from "react";
import { Link } from "react-router-dom";
import { GUIDE_POSTS } from "../utils/guideData";
import { ChevronRight, FileText } from "lucide-react";
import useDocumentMeta from "../hooks/useDocumentMeta";
import { SITE_URL } from "../constants/site";

const GuideListPage = () => {
  useDocumentMeta({
    title: "연금 가이드 | 연금계산기",
    description:
      "국민연금, 기초연금, 노후자금 관련 장문 가이드를 한 곳에서 확인하고 연금 시뮬레이션까지 연결하세요.",
    canonical: `${SITE_URL}${window.location.pathname}`,
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-3">
          <FileText className="text-blue-600" size={32} />
          연금 가이드
        </h2>
        <p className="text-slate-500 mt-2">
          전문가가 알려주는 2026년 연금 활용법과 노후 설계 노하우
        </p>
      </div>

      <div className="grid gap-6">
        {GUIDE_POSTS.map((post) => (
          <Link
            key={post.id}
            to={`/guide/${post.id}`}
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                {post.category}
              </span>
              <span className="text-xs text-slate-400">{post.date}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2">
              {post.title}
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              {post.description}
            </p>
            <div className="flex items-center text-sm font-bold text-blue-600">
              자세히 보기 <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GuideListPage;
