import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  calculateNationalPension,
  calculatePensionTax,
  calculateFutureValue,
  calculateDetailedPeriod,
} from "../utils/pensionCalculations";
import {
  Info,
  Calculator,
  TrendingUp,
  Calendar,
  Briefcase,
  BarChart2,
  PlusCircle,
  Trash2,
  AlertCircle,
  Medal,
  Clock,
  CheckCircle,
  User,
  Users,
  Baby,
  Activity,
  Plus,
  Minus,
  Check,
  Search,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import AdSense from "../components/AdSense";

// [Custom Icon] 원화 아이콘
const WonSign = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 6l6 16 4-10 4 10 6-16" />
    <path d="M4 10h16" />
    <path d="M4 14h16" />
  </svg>
);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// [NEW] 예쁜 스크롤 피커 컴포넌트
const DateScrollPicker = ({ year, month, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const yearRef = useRef(null);
  const monthRef = useRef(null);

  // 연도 범위: 1988(국민연금 시작) ~ 현재
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1988 + 2 },
    (_, i) => currentYear + 1 - i,
  ); // 내림차순 (최신순)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 피커가 열릴 때 현재 선택된 위치로 자동 스크롤
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (yearRef.current) {
          const selectedYearEl = yearRef.current.querySelector(
            `[data-value="${year}"]`,
          );
          if (selectedYearEl) {
            selectedYearEl.scrollIntoView({
              block: "center",
              behavior: "smooth",
            });
          }
        }
        if (monthRef.current) {
          const selectedMonthEl = monthRef.current.querySelector(
            `[data-value="${month}"]`,
          );
          if (selectedMonthEl) {
            selectedMonthEl.scrollIntoView({
              block: "center",
              behavior: "smooth",
            });
          }
        }
      }, 100);
    }
  }, [isOpen, year, month]);

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 flex items-center justify-between border rounded-lg bg-white transition-all ${
          isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-300"
        }`}
      >
        <span className="font-bold text-slate-700 text-lg">
          {year}년 {month}월
        </span>
        <ChevronDown
          size={20}
          className={`text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </button>

      {/* Dropdown Scroll Area */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
          <div className="grid grid-cols-2 h-56 divide-x divide-slate-100">
            {/* Year Column */}
            <div
              ref={yearRef}
              className="overflow-y-auto p-2 space-y-1 scrollbar-hide"
            >
              <div className="text-xs font-bold text-slate-400 text-center mb-2 sticky top-0 bg-white py-1">
                연도
              </div>
              {years.map((y) => (
                <div
                  key={y}
                  data-value={y}
                  onClick={() => onChange(y, month)}
                  className={`p-2 text-center text-sm rounded-lg cursor-pointer transition-all ${
                    y === year
                      ? "bg-blue-600 text-white font-bold scale-105"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {y}년
                </div>
              ))}
            </div>

            {/* Month Column */}
            <div
              ref={monthRef}
              className="overflow-y-auto p-2 space-y-1 scrollbar-hide"
            >
              <div className="text-xs font-bold text-slate-400 text-center mb-2 sticky top-0 bg-white py-1">
                월
              </div>
              {months.map((m) => (
                <div
                  key={m}
                  data-value={m}
                  onClick={() => {
                    onChange(year, m);
                    setIsOpen(false); // 월 선택시 닫힘 (UX 편의성)
                  }}
                  className={`p-2 text-center text-sm rounded-lg cursor-pointer transition-all ${
                    m === month
                      ? "bg-blue-600 text-white font-bold scale-105"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {m}월
                </div>
              ))}
            </div>
          </div>
          <div
            className="bg-slate-50 p-2 border-t border-slate-100 text-center cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xs font-bold text-blue-600">닫기</span>
          </div>
        </div>
      )}

      {/* Backdrop to close when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const NationalPensionPage = () => {
  // [NEW] 입력 모드 상태 (simple: 간편추정, precise: 실측입력)
  const [inputMode, setInputMode] = useState("simple");

  const [inputs, setInputs] = useState({
    birthDate: "",
    // [Simple Mode]
    startYear: 2024,
    startMonth: 1,
    initialSalary: 0,
    // [Precise Mode]
    totalPaidMonths: 0, // 공단 데이터: 총 가입기간
    averageMonthlyIncome: 0, // 공단 데이터: B값 (가입기간 중 기준소득월액 평균)

    // [Common]
    retireAge: 60,
    monthlyIncome: 0, // 현재 월 소득 (미래 예측용 Base)
    wageGrowthRate: 3.0,
    excludedPeriods: [],
    hasMilitary: false,
    childCount: 0,
    deferYears: 0,
    earlyYears: 0,
    depSpouse: false,
    depChildren: 0,
    depParents: 0,
    postRetireIncome: 0,
  });

  const [displayBirth, setDisplayBirth] = useState(
    inputs.birthDate.replace(/-/g, ""),
  );
  const [result, setResult] = useState(null);
  const [showTax, setShowTax] = useState(false);

  // 생년월일 핸들러
  const handleBirthDateChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 8) return;
    setDisplayBirth(value);
    if (value.length === 8) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      const day = value.substring(6, 8);
      const dateObj = new Date(year, month - 1, day);
      if (
        dateObj.getFullYear() === parseInt(year) &&
        dateObj.getMonth() === parseInt(month) - 1 &&
        dateObj.getDate() === parseInt(day)
      ) {
        setInputs((prev) => ({
          ...prev,
          birthDate: `${year}-${month}-${day}`,
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs((prev) => {
      let updates = {
        [name]:
          type === "checkbox"
            ? checked
            : name === "birthDate"
              ? value
              : Number(value),
      };
      if (name === "deferYears" && Number(value) > 0) updates.earlyYears = 0;
      if (name === "earlyYears" && Number(value) > 0) updates.deferYears = 0;

      return { ...prev, ...updates };
    });
  };

  const handleStepper = (field, delta) => {
    setInputs((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta),
    }));
  };

  const addExcludedPeriod = () => {
    setInputs((prev) => ({
      ...prev,
      excludedPeriods: [
        ...prev.excludedPeriods,
        {
          startYear: 2025,
          startMonth: 1,
          endYear: 2025,
          endMonth: 6,
          isPayback: false,
        },
      ],
    }));
  };

  const removeExcludedPeriod = (index) => {
    setInputs((prev) => ({
      ...prev,
      excludedPeriods: prev.excludedPeriods.filter((_, i) => i !== index),
    }));
  };

  const handleExcludedChange = (index, field, value) => {
    const newPeriods = [...inputs.excludedPeriods];
    newPeriods[index] = { ...newPeriods[index], [field]: Number(value) };
    setInputs((prev) => ({ ...prev, excludedPeriods: newPeriods }));
  };

  const togglePayback = (index) => {
    const newPeriods = [...inputs.excludedPeriods];
    newPeriods[index] = {
      ...newPeriods[index],
      isPayback: !newPeriods[index].isPayback,
    };
    setInputs((prev) => ({ ...prev, excludedPeriods: newPeriods }));
  };

  // [CORE] 계산 실행
  const handleCalculate = () => {
    if (!inputs.birthDate || displayBirth.length !== 8) {
      alert("생년월일 8자리를 정확히 입력해주세요. (예: 19640501)");
      return;
    }

    let periodData;

    if (inputMode === "precise") {
      // [정밀 모드] 현재 나이 계산
      const now = new Date();
      periodData = calculateDetailedPeriod(
        inputs.birthDate,
        now.getFullYear(),
        now.getMonth() + 1,
        inputs.retireAge,
      );
    } else {
      // [간편 모드]
      periodData = calculateDetailedPeriod(
        inputs.birthDate,
        inputs.startYear,
        inputs.startMonth,
        inputs.retireAge,
      );
    }

    // 2. 연금액 계산
    const pension = calculateNationalPension(
      {
        ...inputs,
        isPreciseMode: inputMode === "precise",
      },
      periodData,
    );

    if (pension.totalPaidMonths < 120 && pension.totalCreditMonths === 0) {
      alert(
        `현재 총 납부 기간이 ${pension.totalPaidMonths}개월입니다. 연금 수령을 위해서는 최소 120개월(10년)을 채워야 합니다.`,
      );
      return;
    }

    const annualTax = calculatePensionTax(pension.yearly);
    const monthlyTax = annualTax / 12;
    const receiptAge = 65 + inputs.deferYears - inputs.earlyYears;
    const yearsUntilReceipt = receiptAge - periodData.currentAge;
    const futureMonthly = calculateFutureValue(
      pension.monthly,
      yearsUntilReceipt,
    );

    let monthlyIncrease = 0;
    if (pension.totalPaybackMonths > 0) {
      const noPaybackInputs = {
        ...inputs,
        excludedPeriods: inputs.excludedPeriods.map((p) => ({
          ...p,
          isPayback: false,
        })),
        isPreciseMode: inputMode === "precise",
      };
      const baseResult = calculateNationalPension(noPaybackInputs, periodData);
      monthlyIncrease = pension.monthly - baseResult.monthly;
    }

    setResult({
      periodYear: Math.floor(pension.totalPaidMonths / 12) || 0,
      periodMonth: pension.totalPaidMonths % 12 || 0,
      startYear: periodData.retireYear + (receiptAge - inputs.retireAge),
      currentAge: periodData.currentAge,
      avgIncome: pension.avgMonthlyIncome || 0,
      creditAmount: pension.creditAmount || 0,
      earningsCutAmount: pension.earningsCutAmount || 0,
      dependentAddOn: pension.dependentAddOn || 0,
      paybackCost: pension.totalPaybackCost || 0,
      paybackMonths: pension.totalPaybackMonths || 0,
      monthlyIncrease: monthlyIncrease || 0,
      currentValue: {
        monthly: pension.monthly || 0,
        monthlyAfterTax: pension.monthly - monthlyTax || 0,
        tax: monthlyTax || 0,
      },
      futureValue: {
        monthly: futureMonthly || 0,
        monthlyAfterTax:
          futureMonthly - calculateFutureValue(monthlyTax, yearsUntilReceipt) ||
          0,
      },
    });
  };

  const chartData = result
    ? {
        labels: ["세전 수령액", "세후 실수령액"],
        datasets: [
          {
            label: "월 예상 수령액 (현재가치 기준)",
            data: [
              result.currentValue.monthly,
              result.currentValue.monthlyAfterTax,
            ],
            backgroundColor: ["#3b82f6", "#10b981"],
            borderRadius: 8,
          },
        ],
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
          <Calculator className="text-primary-600" size={36} />
          국민연금 정밀 계산기
          <span className="text-xs bg-black text-white px-2 py-1 rounded-full">
            2026 Reform
          </span>
        </h2>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
          보험료율 인상(13%), 소득대체율 42% 등 2026년 개혁안이 적용된 전문가용
          시뮬레이터입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
            {/* 모드 전환 탭 */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setInputMode("simple")}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${inputMode === "simple" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                간편 계산
              </button>
              <button
                onClick={() => setInputMode("precise")}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${inputMode === "precise" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                정밀 계산{" "}
                <CheckCircle
                  size={14}
                  className={
                    inputMode === "precise" ? "text-blue-500" : "text-slate-300"
                  }
                />
              </button>
            </div>

            <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2">
              <Info size={20} className="text-slate-500" />
              {inputMode === "simple" ? "기본 정보 입력" : "공단 데이터 입력"}
            </h3>

            <div className="space-y-6">
              {/* 생년월일 (공통) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Calendar size={16} /> 생년월일 (8자리)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={displayBirth}
                    onChange={handleBirthDateChange}
                    placeholder="예: 19640501"
                    maxLength={8}
                    className={`w-full p-3 pl-4 border rounded-lg outline-none text-lg font-bold tracking-widest transition-all ${
                      displayBirth.length === 8
                        ? "border-primary-500 ring-2 ring-primary-100 bg-white"
                        : "border-slate-300 bg-slate-50"
                    }`}
                  />
                  {displayBirth.length === 8 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-600">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </div>
              </div>

              {/* [분기] 입력 모드 */}
              {inputMode === "simple" ? (
                // === 간편 모드 UI ===
                <>
                  {/* [UPDATED] 스크롤 피커 적용 */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                      <Briefcase size={16} /> 최초 가입 시기 (입사일)
                    </label>
                    <DateScrollPicker
                      year={inputs.startYear}
                      month={inputs.startMonth}
                      onChange={(y, m) =>
                        setInputs((prev) => ({
                          ...prev,
                          startYear: y,
                          startMonth: m,
                        }))
                      }
                    />
                  </div>

                  <div className="h-px bg-slate-100 my-4"></div>

                  <h4 className="font-bold text-sm text-primary-700 mb-3 flex items-center gap-1">
                    <WonSign size={16} /> 소득 흐름 (만원 단위)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        가입 당시 소득 (만원)
                      </label>
                      <input
                        type="number"
                        name="initialSalary"
                        value={inputs.initialSalary}
                        onChange={handleChange}
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        현재 월 소득 (만원)
                      </label>
                      <input
                        type="number"
                        name="monthlyIncome"
                        value={inputs.monthlyIncome}
                        onChange={handleChange}
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-blue-50 border-blue-200 focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </>
              ) : (
                // === 정밀 모드 UI ===
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-5">
                  <a
                    href="https://www.nps.or.kr/elctcvlcpt/comm/getOHAC0000M5.do?menuId=MN24001035"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-sm font-bold shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <Search size={16} />
                      <span>내 가입내역 확인하러 가기</span>
                    </div>
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </a>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-blue-100 leading-relaxed shadow-sm">
                    <span className="font-bold text-blue-600">Tip.</span> 위
                    버튼을 눌러 로그인 후<br />
                    <strong>[가입내역 조회]</strong> 화면의 숫자를 옮겨
                    적으세요.
                  </div>

                  {/* 입력 필드들 */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      ① 총 가입자격 유지기간
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="totalPaidMonths"
                        value={inputs.totalPaidMonths}
                        onChange={handleChange}
                        placeholder="예: 120"
                        className="w-full p-3 pr-12 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg bg-white"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                        개월
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      ② B 값 (평균소득)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="averageMonthlyIncome"
                        value={inputs.averageMonthlyIncome}
                        onChange={handleChange}
                        placeholder="예: 250"
                        className="w-full p-3 pr-12 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg bg-white"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                        만원
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 pl-1">
                      * 조회 화면 하단의 'B값' 또는 평균소득 입력
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      ③ 현재 월 소득 (세전)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="monthlyIncome"
                        value={inputs.monthlyIncome}
                        onChange={handleChange}
                        placeholder="예: 300"
                        className="w-full p-3 pr-12 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg bg-white"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                        만원
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 pl-1">
                      * 미래 연금 적립 예측을 위해 필요합니다.
                    </p>
                  </div>
                </div>
              )}

              {/* 공통 입력 필드 (상승률, 납부예외, 부양가족 등 - 기존 동일) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <BarChart2 size={16} /> 향후 소득 상승률 (연평균)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    name="wageGrowthRate"
                    min="0"
                    max="10"
                    step="0.5"
                    value={inputs.wageGrowthRate}
                    onChange={handleChange}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <span className="font-bold text-primary-600 w-12 text-right">
                    {inputs.wageGrowthRate}%
                  </span>
                </div>
              </div>

              {/* 납부 예외 (미래 계획용으로 유지) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-700 flex items-center gap-1">
                    <AlertCircle size={16} /> (미래) 납부 예외 / 추납
                  </label>
                  <button
                    onClick={addExcludedPeriod}
                    className="text-xs flex items-center gap-1 text-primary-600 font-bold hover:text-primary-800 bg-primary-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <PlusCircle size={14} /> 구간 추가
                  </button>
                </div>
                {/* ... (기존 excludedPeriods 매핑 코드 그대로 유지) ... */}
                <div className="space-y-3">
                  {inputs.excludedPeriods.map((period, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${
                        period.isPayback
                          ? "bg-indigo-50 border-indigo-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                          #{idx + 1} 구간
                        </span>
                        <button
                          onClick={() => removeExcludedPeriod(idx)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <div className="flex items-center bg-white border border-slate-300 rounded-md overflow-hidden flex-1 min-w-[100px]">
                          <input
                            type="number"
                            value={period.startYear}
                            onChange={(e) =>
                              handleExcludedChange(
                                idx,
                                "startYear",
                                e.target.value,
                              )
                            }
                            className="w-full p-2 text-center outline-none border-r border-slate-100"
                            placeholder="년"
                          />
                          <input
                            type="number"
                            value={period.startMonth}
                            onChange={(e) =>
                              handleExcludedChange(
                                idx,
                                "startMonth",
                                e.target.value,
                              )
                            }
                            className="w-12 p-2 text-center outline-none"
                            placeholder="월"
                          />
                        </div>
                        <span className="text-slate-400">~</span>
                        <div className="flex items-center bg-white border border-slate-300 rounded-md overflow-hidden flex-1 min-w-[100px]">
                          <input
                            type="number"
                            value={period.endYear}
                            onChange={(e) =>
                              handleExcludedChange(
                                idx,
                                "endYear",
                                e.target.value,
                              )
                            }
                            className="w-full p-2 text-center outline-none border-r border-slate-100"
                            placeholder="년"
                          />
                          <input
                            type="number"
                            value={period.endMonth}
                            onChange={(e) =>
                              handleExcludedChange(
                                idx,
                                "endMonth",
                                e.target.value,
                              )
                            }
                            className="w-12 p-2 text-center outline-none"
                            placeholder="월"
                          />
                        </div>
                      </div>
                      <div
                        onClick={() => togglePayback(idx)}
                        className="mt-1 flex items-center gap-2 cursor-pointer select-none"
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            period.isPayback
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-white border-slate-300"
                          }`}
                        >
                          {period.isPayback && (
                            <CheckCircle size={14} className="text-white" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-indigo-700">
                          이 기간 추납 신청 (ROI 분석)
                        </span>
                      </div>
                    </div>
                  ))}
                  {inputs.excludedPeriods.length === 0 && (
                    <div className="text-xs text-slate-400 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center flex flex-col items-center gap-1">
                      <span>
                        (선택) 앞으로 일을 쉴 계획이 있다면 추가하세요.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 부양가족 (기존 코드 유지) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <Users size={16} /> 부양가족 (연금 가산)
                </label>
                <div className="flex flex-col gap-3">
                  {/* 배우자 */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                      inputs.depSpouse
                        ? "bg-blue-50 border-blue-500 shadow-sm"
                        : "bg-white border-slate-200"
                    }`}
                    onClick={() =>
                      setInputs((prev) => ({
                        ...prev,
                        depSpouse: !prev.depSpouse,
                      }))
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          inputs.depSpouse
                            ? "bg-blue-500 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {inputs.depSpouse ? (
                          <Check size={16} strokeWidth={3} />
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            inputs.depSpouse
                              ? "text-blue-700"
                              : "text-slate-600"
                          }`}
                        >
                          배우자 있음
                        </p>
                        <p className="text-[10px] text-slate-400">
                          연금 수급 대상이 아닌 배우자
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                      +29만원/연
                    </span>
                  </div>

                  {/* 자녀 & 부모 */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* 자녀 */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
                          <Baby size={14} /> 자녀 (19세↓)
                        </p>
                        <p className="text-[10px] text-primary-600 font-bold mt-0.5">
                          +19만원/인
                        </p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                        <button
                          onClick={() => handleStepper("depChildren", -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">
                          {inputs.depChildren}
                        </span>
                        <button
                          onClick={() => handleStepper("depChildren", 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* 부모 */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
                          <Users size={14} /> 부모 (60세↑)
                        </p>
                        <p className="text-[10px] text-primary-600 font-bold mt-0.5">
                          +19만원/인
                        </p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                        <button
                          onClick={() => handleStepper("depParents", -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">
                          {inputs.depParents}
                        </span>
                        <button
                          onClick={() => handleStepper("depParents", 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 크레딧 (기존 코드 유지) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <Medal size={16} /> 2026 크레딧 혜택
                </label>
                <div className="flex flex-col gap-3">
                  {/* 군복무 */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                      inputs.hasMilitary
                        ? "bg-green-50 border-green-500 shadow-sm"
                        : "bg-white border-slate-200"
                    }`}
                    onClick={() =>
                      setInputs((prev) => ({
                        ...prev,
                        hasMilitary: !prev.hasMilitary,
                      }))
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          inputs.hasMilitary
                            ? "bg-green-500 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {inputs.hasMilitary ? (
                          <Check size={16} strokeWidth={3} />
                        ) : (
                          <Medal size={16} />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            inputs.hasMilitary
                              ? "text-green-700"
                              : "text-slate-600"
                          }`}
                        >
                          군복무 크레딧
                        </p>
                        <p className="text-[10px] text-slate-400">
                          실 복무기간 전체 인정 (최대 12개월)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">
                      +12개월
                    </span>
                  </div>

                  {/* 출산 크레딧 */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Baby size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          출산 자녀 수
                        </p>
                        <p className="text-[10px] text-primary-600 font-bold">
                          첫째부터 12개월씩 추가 인정
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                      <button
                        onClick={() => handleStepper("childCount", -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-base font-bold w-6 text-center">
                        {inputs.childCount}
                      </span>
                      <button
                        onClick={() => handleStepper("childCount", 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 재직자 감액 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Activity size={16} /> 은퇴 후 월 소득 (만원 단위)
                </label>
                <input
                  type="number"
                  name="postRetireIncome"
                  value={inputs.postRetireIncome}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="0"
                />
                <p className="text-xs text-slate-400 mt-1">
                  * 509만원 이하는 감액되지 않습니다. (예상 금액 입력)
                </p>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 조기/연기 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <Clock size={16} /> 수령 시기 조정
                </label>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>조기 수령 (최대 5년)</span>
                      <span
                        className={
                          inputs.earlyYears > 0
                            ? "text-red-500 font-bold"
                            : "text-slate-300"
                        }
                      >
                        -{inputs.earlyYears * 6}%
                      </span>
                    </div>
                    <input
                      type="range"
                      name="earlyYears"
                      min="0"
                      max="5"
                      step="1"
                      value={inputs.earlyYears}
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-red-500"
                      disabled={inputs.deferYears > 0}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>연기 수령 (최대 5년)</span>
                      <span
                        className={
                          inputs.deferYears > 0
                            ? "text-blue-600 font-bold"
                            : "text-slate-300"
                        }
                      >
                        +{inputs.deferYears * 7.2}%
                      </span>
                    </div>
                    <input
                      type="range"
                      name="deferYears"
                      min="0"
                      max="5"
                      step="1"
                      value={inputs.deferYears}
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-blue-600"
                      disabled={inputs.earlyYears > 0}
                    />
                  </div>
                </div>
              </div>

              {/* 은퇴 나이 */}
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  은퇴 예상 나이 (만)
                </label>
                <input
                  type="number"
                  name="retireAge"
                  value={inputs.retireAge}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-200 mt-2 text-lg active:scale-[0.98]"
              >
                {inputMode === "precise"
                  ? "정밀 데이터로 분석하기"
                  : "간편 계산 시작"}
              </button>
            </div>
          </div>

          <AdSense
            slot="3685182143"
            label="Main Top Banner"
            style={{ marginBottom: "3rem" }}
          />
        </div>

        {/* Right Side: Result Display (기존 동일) */}
        <div className="md:col-span-7">
          {/* ... (기존 결과 표시 로직 유지) ... */}
          {result ? (
            <div className="space-y-6 animate-fade-in-up">
              {/* ... */}
              {/* (결과 화면 생략 - 이전과 동일) */}
              {/* ... */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary-100">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <h3 className="text-slate-500 text-sm font-medium">
                      매월 받게 될 예상 연금액
                    </h3>
                    <div className="flex flex-wrap items-baseline gap-2 mt-1">
                      <span className="text-3xl md:text-4xl font-extrabold text-slate-800">
                        {Math.floor(
                          showTax
                            ? result.currentValue.monthlyAfterTax
                            : result.currentValue.monthly,
                        ).toLocaleString()}
                      </span>
                      <span className="text-slate-600 font-bold">원</span>
                    </div>
                    {/* ... (배지들) ... */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {inputs.deferYears > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold border border-blue-200">
                          연기 +{(inputs.deferYears * 7.2).toFixed(1)}%
                        </span>
                      )}
                      {inputs.earlyYears > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md font-bold border border-red-200">
                          조기 -{(inputs.earlyYears * 6).toFixed(1)}%
                        </span>
                      )}
                      {result.earningsCutAmount > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-bold border border-orange-200">
                          재직자 감액 적용
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTax(!showTax)}
                    className={`w-full md:w-auto px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                      showTax
                        ? "bg-green-500 text-white shadow-md shadow-green-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {showTax ? "세후 (실수령)" : "세전 (총액)"}
                  </button>
                </div>
                {/* ... (그래프 및 상세정보) ... */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mb-4 text-sm border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      생애 평균 소득(B값)
                    </p>
                    <p className="font-bold text-slate-800">
                      {/* [SAFE] 안전하게 0으로 처리 */}
                      {(result.avgIncome || 0).toLocaleString()}원
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">실 납부 기간</p>
                    <p className="font-bold text-slate-800">
                      {result.periodYear}년 {result.periodMonth}개월
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      크레딧+부양가족
                    </p>
                    <p className="font-bold text-primary-600">
                      연 +
                      {(
                        (result.creditAmount || 0) * 12 +
                        (result.dependentAddOn || 0)
                      ).toLocaleString()}
                      원
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">재직자 감액</p>
                    {result.earningsCutAmount > 0 ? (
                      <p className="font-bold text-red-500">
                        월 -{(result.earningsCutAmount || 0).toLocaleString()}원
                      </p>
                    ) : (
                      <p className="font-bold text-green-600">
                        감액 없음 (안전)
                      </p>
                    )}
                  </div>
                </div>

                {/* 추납 분석 */}
                {result.paybackMonths > 0 && (
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-4">
                    <h4 className="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-1">
                      <TrendingUp size={16} /> 추납(추후납부) 투자 분석
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-indigo-500 mb-1">
                          총 투자 비용
                        </p>
                        <p className="font-bold text-indigo-900">
                          {(result.paybackCost || 0).toLocaleString()}원
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-indigo-500 mb-1">
                          월 수령액 증가
                        </p>
                        <p className="font-bold text-indigo-900">
                          +{(result.monthlyIncrease || 0).toLocaleString()}원
                        </p>
                      </div>
                      <div className="col-span-2 text-xs text-indigo-700 mt-1 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm leading-relaxed">
                        💡{" "}
                        <strong>
                          {(
                            (result.paybackCost || 0) /
                            (result.monthlyIncrease || 1) / // 0으로 나누기 방지
                            12
                          ).toFixed(1)}
                          년
                        </strong>
                        만 받으시면 본전 회수 완료! 그 이후는 평생 이익입니다.
                        (강력 추천)
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-64 mt-4">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-10 min-h-[300px]">
              <Calculator size={48} className="mb-4 opacity-50" />
              <p className="text-center">
                좌측 정보를 입력하면
                <br />
                정밀 분석 결과가 표시됩니다.
              </p>
            </div>
          )}
          <AdSense
            slot="2743635560"
            label="Main Top Banner"
            style={{ marginBottom: "3rem" }}
          />
        </div>
      </div>
    </div>
  );
};

export default NationalPensionPage;
