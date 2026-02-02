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

// [Contents] 정책 및 문의 내용
const POLICY_TEXTS = {
  privacy: `[개인정보처리방침]

1. 개인정보의 처리 목적
'연금계산기'(이하 '서비스')는 사용자가 입력한 어떠한 개인정보(생년월일, 소득, 재산 등)도 서버에 저장하거나 수집하지 않습니다. 모든 계산은 사용자의 웹 브라우저 내에서 자바스크립트를 통해 즉시 처리되며, 브라우저를 닫으면 데이터는 소멸됩니다.

2. 제3자 제공 및 위탁
본 서비스는 원칙적으로 사용자의 데이터를 외부에 제공하거나 위탁하지 않습니다. 단, 구글 애드센스 및 구글 애널리틱스와 같은 외부 분석/광고 도구는 서비스 개선 및 광고 노출을 위해 비식별화된 쿠키 정보를 수집할 수 있습니다.

3. 쿠키(Cookie)의 운용
본 서비스는 사용자의 이용 경험 개선 및 분석을 위해 쿠키를 사용합니다. 사용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용에 제한이 생길 수 있습니다.

4. 개인정보 보호 책임자
본 서비스는 개인 개발자에 의해 운영되며, 관련 문의는 '문의하기' 페이지를 통해 접수해 주시기 바랍니다.`,

  terms: `[이용약관]

제 1 조 (목적)
본 약관은 '연금계산기'(이하 '서비스')가 제공하는 금융 관련 모의 계산 서비스의 이용 조건 및 절차를 규정함을 목적으로 합니다.

제 2 조 (계산 결과의 참고성)
1. 본 서비스가 제공하는 국민연금, 기초연금, 노후자금 진단 결과는 2026년 시행 예정인 법령 및 통계 자료를 바탕으로 한 '추정치'입니다.
2. 개개인의 실제 가입 이력, 소득 산정 방식, 정부 정책의 변경에 따라 실제 수령액과는 상당한 차이가 발생할 수 있습니다.

제 3 조 (책임의 한계)
1. 사용자는 본 서비스의 계산 결과를 단순 참고용으로만 활용해야 하며, 이를 근거로 한 금융 결정 및 법적 행위에 대한 책임은 전적으로 사용자 본인에게 있습니다.
2. 본 서비스는 계산 결과의 오류나 누락으로 인해 발생하는 어떠한 손해에 대해서도 법적 책임을 지지 않습니다. 정확한 상담은 국민연금공단 등 관계 기관을 이용하시기 바랍니다.

제 4 조 (서비스의 중단)
본 서비스는 개발자의 사정에 따라 예고 없이 변경되거나 중단될 수 있습니다.`,

  contact: `[문의하기]

연금계산기 서비스 이용 중 발생한 오류 제보, 기능 건의, 혹은 제휴 문의가 있으시면 아래의 채널로 연락 주시기 바랍니다.

📧 이메일: qkqhqk14@gmail.com
💬 블로그: Heoncode.tistory.com

사용자가 입력하시는 정보는 서버로 전송되지 않으므로, 계산 오류 제보 시에는 입력하셨던 조건(나이, 소득 등)을 함께 적어주시면 빠른 확인이 가능합니다.`,
};

const HomePage = () => (
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

const MenuCard = ({ to, icon, title, desc, active = false }) => (
  <Link
    to={to}
    className={`block group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 border ${active ? "bg-white border-blue-100 shadow-xl shadow-blue-50 hover:shadow-2xl hover:border-blue-200" : "bg-white opacity-50"}`}
  >
    <div className="mb-4 inline-flex p-3 rounded-xl bg-blue-50 text-blue-600 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed word-keep-all">
      {desc}
    </p>
  </Link>
);

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`text-sm font-bold transition-colors ${isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
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
    className="text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 group whitespace-nowrap"
  >
    {children}
    <ExternalLink size={12} className="opacity-50" />
  </a>
);

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white group-hover:bg-blue-600 transition-all duration-300">
              <Calculator size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
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
            {/* [NEW] 블로그 가이드 (애드센스용) */}
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
              <Link
                to="/national"
                className="block font-bold text-slate-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                국민연금 계산기
              </Link>
              <Link
                to="/basic"
                className="block font-bold text-slate-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                기초연금 진단
              </Link>
              <Link
                to="/target"
                className="block font-bold text-slate-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                노후 자금 진단
              </Link>
              <Link
                to="/guide"
                className="block font-bold text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
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
                content={POLICY_TEXTS.privacy}
              />
            }
          />
          <Route
            path="/terms"
            element={
              <PolicyPage title="이용약관" content={POLICY_TEXTS.terms} />
            }
          />
          <Route
            path="/contact"
            element={
              <PolicyPage title="문의하기" content={POLICY_TEXTS.contact} />
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
                <span className="font-bold text-xl text-slate-800">
                  연금계산기
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                대한민국 모든 세대를 위한 노후 설계 시뮬레이션
              </p>
            </div>

            {/* [NEW] 하단 정책 링크들 */}
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
              <Link to="/privacy" className="hover:text-blue-600">
                개인정보처리방침
              </Link>
              <Link to="/terms" className="hover:text-blue-600">
                이용약관
              </Link>
              <Link to="/contact" className="hover:text-blue-600">
                문의하기
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
