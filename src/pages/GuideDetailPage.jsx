import React, { useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // 플러그인 추가
import { GUIDE_POSTS } from "../utils/guideData";
import { ChevronLeft, ShieldCheck, Info, Calculator } from "lucide-react";

const GuideDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const post = GUIDE_POSTS.find((p) => p.id === parseInt(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!post)
    return (
      <div className="text-center py-20 text-slate-500">
        글을 찾을 수 없습니다.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 animate-fade-in-up">
      <Link
        to="/guide"
        className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-600 mb-8 transition-colors"
      >
        <ChevronLeft size={16} /> 목록으로 돌아가기
      </Link>

      <header className="mb-10 border-b border-slate-100 pb-10">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-4 inline-block font-sans">
          {post.category}
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-6 word-keep-all tracking-tight">
          {post.title}
        </h1>
        <p className="text-slate-400 text-sm italic flex items-center gap-2 font-sans">
          <ShieldCheck size={14} className="text-blue-500" /> 보건복지부 및
          공공데이터 개정안 기반 작성
        </p>
      </header>

      {/* 마크다운 본문 - 표 스타일 강화 */}
      <article
        className="prose prose-slate max-w-none text-slate-600 
        /* 문단 및 리스트 행간/간격 */
        [&_p]:leading-[1.9] [&_p]:mb-10 [&_li]:leading-[1.9] [&_li]:mb-5
        /* 표 스타일 강화 */
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-12 [&_table]:border-2 [&_table]:border-slate-900
        [&_th]:border-2 [&_th]:border-slate-900 [&_th]:bg-slate-100 [&_th]:p-4 [&_th]:text-slate-900 [&_th]:font-bold
        [&_td]:border-2 [&_td]:border-slate-900 [&_td]:p-4 [&_td]:bg-white
        /* 제목 및 가로줄 여백 강화 */
        prose-h2:text-3xl prose-h2:mt-20 prose-h2:mb-10 prose-h2:pb-6 prose-h2:border-b-2 prose-h2:border-slate-200
        prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </article>

      {/* Disclaimer */}
      <div className="mt-16 p-6 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
        <h5 className="text-amber-800 font-bold text-base mb-3 flex items-center gap-2">
          <Info size={18} /> 유의사항 (Disclaimer)
        </h5>
        <p className="text-amber-700/80 text-sm leading-relaxed word-keep-all">
          본 가이드의 내용은 관련 법령 및 공공 데이터를 바탕으로 작성된 일반적인
          정보이며, 개개인의 구체적인 상황에 따라 실제 결과와 다를 수 있습니다.
          본 서비스는 제공된 정보에 기반한 사용자의 결정에 대해 법적 책임을 지지
          않으므로, 정확한 내용은 반드시 주관 기관인 국민연금공단을 통해
          상담받으시길 권장합니다.
        </p>
      </div>

      {/* 하단 CTA */}
      <div className="mt-20 p-10 bg-slate-900 rounded-[2rem] text-center text-white shadow-2xl shadow-blue-900/10">
        <Calculator
          size={48}
          className="mx-auto mb-6 text-blue-500 opacity-80"
        />
        <h4 className="font-extrabold text-2xl mb-3">
          나의 노후 자산을 정밀 진단해보세요
        </h4>
        <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
          2026년 개정안이 적용된 데이터로
          <br />
          가장 정확한 은퇴 지도를 그려드립니다.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            to="/target"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg hover:-translate-y-1"
          >
            노후 자금 진단하기
          </Link>
          <Link
            to="/national"
            className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-700 hover:-translate-y-1"
          >
            국민연금 계산하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuideDetailPage;
