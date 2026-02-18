import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  Calculator,
  Landmark,
  TrendingUp,
  Menu,
  X,
  ExternalLink,
  FileText,
  Mail,
} from "lucide-react";
import NationalPensionPage from "./pages/NationalPensionPage";
import BasicPensionPage from "./pages/BasicPensionPage";
import TargetPensionPage from "./pages/TargetPensionPage";
import PolicyPage from "./pages/PolicyPage";
import GuideListPage from "./pages/GuideListPage";
import GuideDetailPage from "./pages/GuideDetailPage";
import ScrollToTop from "./components/ScrollToTop";
import useDocumentMeta from "./hooks/useDocumentMeta";
import { SITE_URL } from "./constants/site";

const HomePage = () => {
  useDocumentMeta({
    title: "연금계산기 | 국민연금·기초연금·노후자금 시뮬레이션",
    description:
      "2026년 개정안을 반영한 연금 시뮬레이터와 장문 가이드를 통해 국민연금·기초연금·노후자금을 한 번에 점검하세요.",
    canonical: `${SITE_URL}${window.location.pathname}`,
  });

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-8 animate-fade-in-up">
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-4">
          2026년 연금개혁안 완벽 반영
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight word-keep-all">
          내 노후 자산,
          <br />
          <span className="text-blue-600">가장 정확하게</span> 확인하세요.
        </h1>
        <p className="text-slate-500 text-lg md:text-xl leading-relaxed word-keep-all">
          국민연금부터 기초연금, 노후 자산 진단까지.
          <br className="md:hidden" />
          복잡한 인증 없이 1분 만에 분석해 드립니다.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mt-12 px-4">
        <MenuCard
          to="/national"
          icon={<Calculator size={32} />}
          title="국민연금 정밀 계산"
          desc="2026년 A값, 보험료 인상 스케줄 반영"
          active
        />
        <MenuCard
          to="/basic"
          icon={<Landmark size={32} />}
          title="기초연금 수급 자격"
          desc="2026년 선정기준액 기반 즉시 판정"
          active
        />
        <MenuCard
          to="/target"
          icon={<TrendingUp size={32} />}
          title="노후 자금 진단"
          desc="인플레이션을 반영한 실질 목돈 계산"
          active
        />
      </div>
    </div>
  );
};

const MenuCard = ({ to, icon, title, desc, active = false }) => (
  <Link
    to={to}
    className={`block group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 border ${active ? "bg-white border-blue-100 shadow-xl shadow-blue-50 hover:shadow-2xl hover:border-blue-200" : "bg-white opacity-50"}`}
  >
    <div className="mb-4 inline-flex p-3 rounded-xl bg-blue-50 text-blue-600 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed word-keep-all">{desc}</p>
  </Link>
);

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`text-sm font-bold tracking-tight transition-colors ${
        isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
};

const ExternalNavLink = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm font-medium text-slate-400 hover:text-slate-600 inline-flex items-center gap-1"
  >
    {children} <ExternalLink size={14} />
  </a>
);

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-pretendard antialiased flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Calculator size={20} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-none">
                연금<span className="text-blue-600">계산기</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-bold tracking-tighter leading-none mt-1">
                2026년 개정안 반영
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <NavLink to="/national">국민연금</NavLink>
            <NavLink to="/basic">기초연금</NavLink>
            <NavLink to="/target">노후 자금</NavLink>
            <NavLink to="/guide">연금 가이드</NavLink>

            <div className="w-px h-3 bg-slate-300 mx-2"></div>

            <ExternalNavLink href="https://mysalarycalc.com/">
              2026 실수령액
            </ExternalNavLink>
            <ExternalNavLink href="https://www.loancalc2026.com/">
              대출이자 계산기
            </ExternalNavLink>
          </nav>

          <button
            className="lg:hidden text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 absolute w-full shadow-lg">
            <div className="space-y-4">
              <Link to="/national" className="block font-bold text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>
                국민연금 계산기
              </Link>
              <Link to="/basic" className="block font-bold text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>
                기초연금 진단
              </Link>
              <Link to="/target" className="block font-bold text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>
                노후 자금 진단
              </Link>
              <Link to="/guide" className="block font-bold text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                연금 가이드(글)
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto">
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/national" element={<NationalPensionPage />} />
          <Route path="/basic" element={<BasicPensionPage />} />
          <Route path="/target" element={<TargetPensionPage />} />
          <Route path="/guide" element={<GuideListPage />} />
          <Route path="/guide/:id" element={<GuideDetailPage />} />
          <Route
            path="/privacy"
            element={
              <PolicyPage
                title="개인정보처리방침"
                description="연금계산기 서비스의 개인정보 처리 방침과 쿠키 운영 정책입니다."
                contentPath="/content/policies/privacy.md"
              />
            }
          />
          <Route
            path="/terms"
            element={
              <PolicyPage
                title="이용약관"
                description="연금계산기 서비스 이용 약관과 책임 범위를 안내합니다."
                contentPath="/content/policies/terms.md"
              />
            }
          />
          <Route
            path="/contact"
            element={
              <PolicyPage
                title="문의하기"
                description="오류 제보, 기능 건의, 제휴 문의를 위한 공식 문의 채널입니다."
                contentPath="/content/policies/contact.md"
              />
            }
          />
        </Routes>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start items-center gap-2 mb-3">
                <Calculator size={24} className="text-slate-400" />
                <span className="font-bold text-xl text-slate-800">연금계산기</span>
              </div>
              <p className="text-slate-400 text-sm">
                대한민국 모든 세대를 위한 노후 설계 시뮬레이션
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
              <Link to="/privacy" className="hover:text-blue-600">
                개인정보처리방침
              </Link>
              <Link to="/terms" className="hover:text-blue-600">
                이용약관
              </Link>
              <Link to="/contact" className="hover:text-blue-600 inline-flex items-center gap-1">
                <Mail size={14} /> 문의하기
              </Link>
            </div>
          </div>

          <div className="h-px bg-slate-100 mb-8"></div>

          <div className="text-center">
            <p className="text-slate-300 text-xs word-keep-all max-w-2xl mx-auto leading-relaxed">
              본 사이트의 모든 계산 결과는 2026년 시행 예정인 국민연금 및
              기초연금 개정안을 바탕으로 산출된 모의 결과입니다. 정확한 수령액은
              가입 내역과 소득에 따라 상이할 수 있으므로 국민연금공단(NPS)을
              통해 재확인 바랍니다.
            </p>
            <div className="mt-6 flex justify-center gap-4 text-xs text-slate-400">
              <ExternalNavLink href="https://mysalarycalc.com/">
                2026 실수령액 계산기
              </ExternalNavLink>
              <span className="text-slate-200">|</span>
              <ExternalNavLink href="https://www.loancalc2026.com/">
                대출이자 계산기
              </ExternalNavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
