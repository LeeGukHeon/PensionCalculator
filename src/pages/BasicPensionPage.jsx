import React, { useState } from "react";
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
import { BASIC_PENSION_CONSTANTS } from "../utils/pensionPolicyData";
import {
  Calculator,
  Info,
  CheckCircle,
  XCircle,
  Building,
  Briefcase,
  Wallet,
  Car,
  TrendingUp,
  User,
  Users,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import AdSense from "./components/AdSense";
// [Component] 원화 아이콘
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

/**
 * [Logic] 기초연금 소득인정액 계산 함수
 * (UI 컴포넌트 렌더링과 분리하여 관리)
 */
const calculateBasicPensionLogic = (inputs) => {
  const {
    isCouple,
    isSpouseWorking,
    region,
    earnedIncome,
    spouseEarnedIncome,
    pensionIncome,
    otherIncome,
    generalProperty,
    financialProperty,
    debt,
    luxuryCarValue,
  } = inputs;

  const C = BASIC_PENSION_CONSTANTS;

  // 1. 소득 평가액 계산 (Monthly Income Evaluation)
  // 근로소득 공제: (소득 - 118만) * 0.7
  // 주의: 만원 단위 입력이므로 C.EARNED_INCOME_DEDUCTION(원)을 만원으로 나눠서 계산
  const DEDUCTION_AMT = C.EARNED_INCOME_DEDUCTION / 10000;

  const calcEarnedIncome = (income) => {
    const taxable = Math.max(0, income - DEDUCTION_AMT);
    return taxable * 0.7;
  };

  let totalEarnedEval = calcEarnedIncome(earnedIncome);

  // 부부이고 배우자가 일하면 배우자 급여도 별도 공제 후 합산
  if (isCouple && isSpouseWorking) {
    totalEarnedEval += calcEarnedIncome(spouseEarnedIncome);
  }

  const monthlyIncomeEval = totalEarnedEval + pensionIncome + otherIncome;

  // 2. 재산의 소득 환산액 (Property Income Conversion)
  // 지역별 공제액 (만원 단위 변환)
  const propertyDeduction = C.DEDUCTION_HOUSE[region] / 10000;
  // 일반재산 - 공제액 (음수 방지)
  const basicProperty = Math.max(0, generalProperty - propertyDeduction);

  // 금융재산 공제 (2000만원)
  const financialDeduction = C.DEDUCTION_FINANCE / 10000;
  const financialNet = Math.max(0, financialProperty - financialDeduction);

  // 순자산 = (일반 + 금융) - 부채
  // 부채는 재산 총액 한도 내에서만 차감
  const netProperty = Math.max(0, basicProperty + financialNet - debt);

  // 소득 환산 (연 4% / 12개월)
  const propertyIncomeMonth = netProperty * C.CONVERSION_RATE;

  // 3. P-value (고급차량 등) -> 월 소득 100% 반영 (가장 강력한 탈락 사유)
  // 4000만원 이상이면 차량가액 전체가 월 소득으로 잡힘
  const LUXURY_LIMIT = C.LUXURY_CAR_PRICE / 10000;
  const pValueIncome = luxuryCarValue >= LUXURY_LIMIT ? luxuryCarValue : 0;

  // 4. 최종 소득인정액
  const recognizedIncome =
    monthlyIncomeEval + propertyIncomeMonth + pValueIncome;

  // 5. 판정 (2026 확정 기준 적용)
  // 단독: 247만, 부부: 395.2만
  const limit = isCouple ? C.LIMIT_COUPLE / 10000 : C.LIMIT_SINGLE / 10000;
  const isEligible = recognizedIncome <= limit;

  // 6. 예상 수령액 (2026 기준연금액: 349,700원)
  let estimatedPension = C.FULL_AMOUNT;

  // 부부 감액 (각각 20% 감액 -> 부부 합산 시 총액의 80% * 2 = 1.6배)
  // 즉, 단독은 34.9만, 부부는 합산 약 55.9만
  if (isCouple) {
    estimatedPension = estimatedPension * 2 * 0.8;
  }

  // *소득역전 방지 감액* (간이 로직)
  // 소득인정액 + 기초연금액 > 선정기준액 이면, 초과분만큼 감액
  // (단, 기초연금액의 10%까지만 최저지급 보장 등이 있으나 여기선 단순 차감)
  if (isEligible) {
    const potentialTotal = recognizedIncome * 10000 + estimatedPension;
    const limitWon = limit * 10000;

    if (potentialTotal > limitWon) {
      const cutAmount = potentialTotal - limitWon;
      // 최저 지급액(기준연금액의 10%) 보장 룰은 복잡하므로 일단 차감 로직만 적용
      // 단, 계산된 연금액에서 차감
      estimatedPension = Math.max(
        estimatedPension - cutAmount,
        C.FULL_AMOUNT * 0.1,
      );
    }
  }

  return {
    recognizedIncome: Math.round(recognizedIncome),
    limit: Math.round(limit), // 소수점 반올림 (395.2 -> 395)
    limitRaw: limit, // 정확한 비교용
    isEligible,
    estimatedPension: Math.floor(estimatedPension / 10) * 10, // 10원 단위 절사
    breakdown: {
      income: Math.round(monthlyIncomeEval),
      property: Math.round(propertyIncomeMonth),
      luxury: Math.round(pValueIncome),
    },
  };
};

const BasicPensionPage = () => {
  // Input State
  const [inputs, setInputs] = useState({
    isCouple: false,
    isSpouseWorking: false,
    region: "METRO",

    // 월 소득 (만원)
    earnedIncome: 0,
    spouseEarnedIncome: 0,
    pensionIncome: 0,
    otherIncome: 0,

    // 재산 (만원)
    generalProperty: 0,
    financialProperty: 0,
    debt: 0,

    // P-value
    luxuryCarValue: 0,
  });

  const [result, setResult] = useState(null);

  // Input Handler
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCalculate = () => {
    const calcResult = calculateBasicPensionLogic(inputs);
    setResult(calcResult);
  };

  // Chart Data
  const chartData = result
    ? {
        labels: ["나의 소득인정액", "선정 기준액"],
        datasets: [
          {
            label: "금액 (만원)",
            data: [result.recognizedIncome, result.limitRaw],
            backgroundColor: [
              result.isEligible ? "#3b82f6" : "#ef4444",
              "#94a3b8",
            ],
            borderRadius: 6,
            barThickness: 20,
          },
        ],
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
          <Calculator className="text-primary-600" size={36} />
          기초연금 모의 계산
          <span className="text-xs bg-slate-900 text-white px-2 py-1 rounded-full">
            2026 확정
          </span>
        </h2>
        <div className="mt-3 bg-white border border-slate-200 rounded-lg p-3 inline-block md:block text-left shadow-sm">
          <p className="text-slate-600 text-sm flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" />
            <strong>단독가구 기준:</strong> 소득인정액 월 247만원 이하
          </p>
          <p className="text-slate-600 text-sm flex items-center gap-2 mt-1">
            <CheckCircle size={14} className="text-green-500" />
            <strong>부부가구 기준:</strong> 소득인정액 월 395.2만원 이하
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Input Form */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2">
              <Info size={20} className="text-slate-500" /> 자가 진단 입력
            </h3>

            <div className="space-y-6">
              {/* 가구 유형 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  가구 유형
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setInputs((prev) => ({ ...prev, isCouple: false }))
                    }
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${!inputs.isCouple ? "bg-slate-800 border-slate-800 text-white font-bold" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                  >
                    <User size={18} /> 단독 가구
                  </button>
                  <button
                    onClick={() =>
                      setInputs((prev) => ({ ...prev, isCouple: true }))
                    }
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${inputs.isCouple ? "bg-slate-800 border-slate-800 text-white font-bold" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                  >
                    <Users size={18} /> 부부 가구
                  </button>
                </div>
              </div>

              {/* 거주지 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Building size={16} /> 거주 지역 (재산 공제)
                </label>
                <select
                  name="region"
                  value={inputs.region}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                >
                  <option value="METRO">대도시 (공제 1억 3,500만)</option>
                  <option value="CITY">중소도시 (공제 8,500만)</option>
                  <option value="RURAL">농어촌 (공제 7,250만)</option>
                </select>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 소득 정보 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <Briefcase size={16} /> 월 소득 (만원 단위)
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">
                      본인 근로소득
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="earnedIncome"
                        value={inputs.earnedIncome}
                        onChange={handleChange}
                        className="w-24 p-2 border rounded-lg text-right outline-none focus:border-primary-500 transition-all bg-slate-50 focus:bg-white"
                        placeholder="0"
                      />
                      <span className="text-sm text-slate-500">만원</span>
                    </div>
                  </div>

                  {inputs.isCouple && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 transition-all animate-fade-in-up">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">
                          배우자 근로 여부
                        </span>
                        <input
                          type="checkbox"
                          checked={inputs.isSpouseWorking}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              isSpouseWorking: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-slate-800 cursor-pointer"
                        />
                      </div>
                      {inputs.isSpouseWorking && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            배우자 월 급여
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              name="spouseEarnedIncome"
                              value={inputs.spouseEarnedIncome}
                              onChange={handleChange}
                              className="w-24 p-1 border rounded text-right outline-none text-sm focus:border-primary-500"
                              placeholder="0"
                            />
                            <span className="text-xs text-slate-500">만원</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-600 font-medium">
                        연금·기타 소득
                      </span>
                      <span className="text-[10px] text-slate-400">
                        국민연금, 임대소득 등
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="pensionIncome"
                        value={inputs.pensionIncome}
                        onChange={handleChange}
                        className="w-24 p-2 border rounded-lg text-right outline-none focus:border-primary-500 transition-all bg-slate-50 focus:bg-white"
                        placeholder="0"
                      />
                      <span className="text-sm text-slate-500">만원</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 재산 정보 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <Wallet size={16} /> 재산 정보 (만원 단위)
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">
                      일반재산 (부동산)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="generalProperty"
                        value={inputs.generalProperty}
                        onChange={handleChange}
                        className="w-28 p-2 border rounded-lg text-right outline-none focus:border-primary-500 transition-all bg-slate-50 focus:bg-white"
                        placeholder="0"
                      />
                      <span className="text-sm text-slate-500">만원</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">
                      금융재산 (예금 등)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="financialProperty"
                        value={inputs.financialProperty}
                        onChange={handleChange}
                        className="w-28 p-2 border rounded-lg text-right outline-none focus:border-primary-500 transition-all bg-slate-50 focus:bg-white"
                        placeholder="0"
                      />
                      <span className="text-sm text-slate-500">만원</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-500 font-bold">
                      부채 (대출/보증금)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="debt"
                        value={inputs.debt}
                        onChange={handleChange}
                        className="w-28 p-2 border rounded-lg text-right outline-none border-red-200 bg-red-50 focus:border-red-400 text-red-600 font-bold"
                        placeholder="0"
                      />
                      <span className="text-sm text-slate-500">만원</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 고급 자동차 */}
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 transition-all hover:shadow-sm">
                <label className="block text-sm font-bold text-orange-800 mb-2 flex items-center gap-1">
                  <Car size={16} /> 고급 자동차 / 회원권
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-700 leading-tight">
                    차량가액 4천만원 이상
                    <br />
                    또는 콘도/골프 회원권
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="luxuryCarValue"
                      value={inputs.luxuryCarValue}
                      onChange={handleChange}
                      className="w-24 p-2 border border-orange-200 rounded-lg text-right outline-none focus:border-orange-400 bg-white"
                      placeholder="0"
                    />
                    <span className="text-sm text-orange-600 font-bold">
                      만원
                    </span>
                  </div>
                </div>
                {inputs.luxuryCarValue >= 4000 && (
                  <p className="text-[11px] text-red-500 font-bold mt-2 flex items-center gap-1">
                    <AlertTriangle size={12} /> 주의: 차량가액 전체가 월
                    소득으로 잡힙니다.
                  </p>
                )}
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-200 mt-2 text-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Calculator size={20} /> 수급 자격 조회하기
              </button>
            </div>
          </div>

          <AdSense
            slot="3924893287"
            label="Main Top Banner"
            style={{ marginBottom: "3rem" }}
          />
        </div>

        {/* Right: Result Display */}
        <div className="md:col-span-7">
          {result ? (
            <div className="space-y-6 animate-fade-in-up">
              {/* 1. Main Result Card */}
              <div
                className={`p-6 rounded-2xl shadow-xl border-2 transition-all ${result.isEligible ? "bg-white border-blue-500 shadow-blue-100" : "bg-white border-red-200 shadow-red-50"}`}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-slate-500 text-sm font-bold mb-2">
                      2026년 기준 판정 결과
                    </h3>
                    {result.isEligible ? (
                      <div className="flex items-center gap-3 text-blue-600">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <CheckCircle size={32} strokeWidth={3} />
                        </div>
                        <div>
                          <span className="text-3xl font-extrabold block leading-none">
                            수급 가능
                          </span>
                          <span className="text-sm font-medium text-blue-400 mt-1 block">
                            기준 이하입니다.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-500">
                        <div className="bg-slate-100 p-2 rounded-full">
                          <XCircle size={32} strokeWidth={3} />
                        </div>
                        <div>
                          <span className="text-3xl font-extrabold block leading-none text-slate-700">
                            수급 불가
                          </span>
                          <span className="text-sm font-medium text-slate-400 mt-1 block">
                            기준을 초과했습니다.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {result.isEligible && (
                    <div className="bg-blue-50 px-6 py-4 rounded-xl border border-blue-100 text-center md:text-right w-full md:w-auto">
                      <p className="text-xs text-blue-600 font-bold mb-1">
                        최대 예상 수령액 (
                        {inputs.isCouple ? "부부 합산" : "단독"})
                      </p>
                      <p className="text-3xl font-black text-blue-700 flex items-center justify-center md:justify-end gap-1">
                        <span className="text-lg opacity-60">월</span>{" "}
                        {result.estimatedPension.toLocaleString()}
                        <span className="text-lg">원</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Bar Visual */}
                <div className="mt-8">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span
                      className={
                        result.isEligible ? "text-blue-600" : "text-red-500"
                      }
                    >
                      내 인정액: {result.recognizedIncome.toLocaleString()}만원
                    </span>
                    <span className="text-slate-800">
                      커트라인: {result.limitRaw.toLocaleString()}만원
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                    {/* Limit Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-20"
                      style={{
                        left: `${Math.min(100, (result.limitRaw / (Math.max(result.limitRaw, result.recognizedIncome) * 1.1)) * 100)}%`,
                      }}
                    ></div>

                    {/* User Value Bar */}
                    <div
                      className={`h-full transition-all duration-1000 rounded-full ${result.isEligible ? "bg-blue-500" : "bg-red-500"}`}
                      style={{
                        width: `${Math.min(100, (result.recognizedIncome / (Math.max(result.limitRaw, result.recognizedIncome) * 1.1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 2. Detail Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 소득평가액 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                      <Briefcase size={14} /> 소득 평가액
                    </div>
                    <p className="text-xl font-extrabold text-slate-800">
                      {result.breakdown.income.toLocaleString()}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        만원
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 leading-snug">
                      근로소득 공제(118만원) 적용 후 70%만 반영된 금액입니다.
                    </p>
                  </div>
                </div>

                {/* 재산환산액 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                      <Building size={14} /> 재산 환산액
                    </div>
                    <p className="text-xl font-extrabold text-slate-800">
                      {result.breakdown.property.toLocaleString()}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        만원
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 leading-snug">
                      지역별 공제 및 금융재산 공제 후 연 4%를 월할 계산했습니다.
                    </p>
                  </div>
                </div>

                {/* 고급차량 */}
                <div
                  className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between ${result.breakdown.luxury > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <div
                      className={`flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wide ${result.breakdown.luxury > 0 ? "text-red-600" : "text-slate-500"}`}
                    >
                      <Car size={14} /> P-값 (특수)
                    </div>
                    <p
                      className={`text-xl font-extrabold ${result.breakdown.luxury > 0 ? "text-red-600" : "text-slate-800"}`}
                    >
                      {result.breakdown.luxury.toLocaleString()}{" "}
                      <span className="text-sm font-normal opacity-70">
                        만원
                      </span>
                    </p>
                  </div>
                  <div
                    className={`mt-3 pt-3 border-t ${result.breakdown.luxury > 0 ? "border-red-100" : "border-slate-100"}`}
                  >
                    <p
                      className={`text-[10px] leading-snug ${result.breakdown.luxury > 0 ? "text-red-500 font-bold" : "text-slate-400"}`}
                    >
                      {result.breakdown.luxury > 0
                        ? "차량가액이 월 소득으로 100% 반영되었습니다."
                        : "해당 없음"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Analysis Report */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex gap-5 items-start">
                <div className="bg-white/10 p-3 rounded-full shrink-0">
                  <TrendingUp className="text-green-400" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">전문가 분석 리포트</h4>
                  <div className="text-sm text-slate-300 leading-relaxed space-y-2">
                    {!result.isEligible ? (
                      <>
                        <p>
                          안타깝게도{" "}
                          <strong className="text-white">
                            소득인정액(
                            {result.recognizedIncome.toLocaleString()}만원)
                          </strong>
                          이 2026년 선정기준액(
                          {result.limitRaw.toLocaleString()}만원)을
                          초과하였습니다.
                        </p>
                        <p className="bg-white/10 p-2 rounded text-xs text-slate-200">
                          <strong>💡 원인 분석:</strong>
                          <br />
                          {result.breakdown.luxury > 0
                            ? "고급 자동차(4,000만원 이상) 보유로 인해 차량가액 전체가 소득으로 잡혔습니다. 차량 명의 변경 등을 고려해보세요."
                            : result.breakdown.property >
                                result.breakdown.income
                              ? "소득보다는 '재산 환산액'의 비중이 높습니다. 부채 증명이나 재산 조정이 필요할 수 있습니다."
                              : "근로/연금 소득이 기준보다 높습니다. 소득 기반 수급은 어려울 수 있습니다."}
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          축하합니다! 현재 기준으로{" "}
                          <strong className="text-green-400">수급 대상</strong>
                          에 해당합니다.
                        </p>
                        <p>
                          {inputs.isCouple ? "부부 가구" : "단독 가구"} 기준을
                          충족하며, 매월{" "}
                          <strong>
                            약 {result.estimatedPension.toLocaleString()}원
                          </strong>
                          (2026년 기준)이 지급될 것으로 예상됩니다.
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          * 단, 국민연금 수령액이 월 52만원(추정)을 초과할 경우
                          기초연금액이 일부 감액될 수 있습니다. (국민연금 연계
                          감액 제도)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 mt-4 bg-white p-4 rounded-xl border border-slate-200">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y", // 가로형 막대
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        grid: { color: "#f1f5f9" },
                        beginAtZero: true,
                      },
                      y: { grid: { display: false } },
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-10 min-h-[300px]">
              <Calculator
                size={64}
                className="mb-6 opacity-20 text-slate-900"
              />
              <p className="text-center text-slate-500 font-medium">
                좌측에 소득과 재산 정보를 입력하면
                <br />
                <span className="text-slate-800 font-bold">
                  2026년 확정 기준
                </span>
                으로
                <br />
                수급 자격을 즉시 진단해 드립니다.
              </p>
            </div>
          )}
          <div className="mt-6 bg-slate-100 rounded-lg h-32 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200">
            <AdSense
              slot="5561370591"
              label="Main Top Banner"
              style={{ marginBottom: "3rem" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicPensionPage;
