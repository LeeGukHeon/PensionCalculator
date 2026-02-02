import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Calculator,
  Info,
  TrendingUp,
  Target,
  PiggyBank,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle,
  User,
  Briefcase,
  Sunset,
} from "lucide-react";
import AdSense from "../components/common/AdSense"; // 광고 컴포넌트 추가 Update
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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const TargetPensionPage = () => {
  // [State] 입력값 관리
  const [inputs, setInputs] = useState({
    currentAge: 30,
    retireAge: 60,
    deathAge: 90,

    targetMonthly: 300,
    expectedPension: 100,

    currentAssets: 5000,
    monthlySaving: 100,

    returnRate: 5.0,
    safeReturnRate: 3.0,
    inflationRate: 2.5,
  });

  const [result, setResult] = useState(null);

  // [Handler] 입력 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // [Handler] 스텝퍼
  const handleStepper = (field, delta) => {
    setInputs((prev) => {
      const newValue = Math.max(0, (prev[field] || 0) + delta);
      return { ...prev, [field]: newValue };
    });
  };

  // [Logic] 노후 자금 정밀 계산 엔진
  const calculateRetirementPlan = () => {
    const {
      currentAge,
      retireAge,
      deathAge,
      targetMonthly,
      expectedPension,
      currentAssets,
      monthlySaving,
      returnRate,
      safeReturnRate,
      inflationRate,
    } = inputs;

    // 1. 기간 유효성 검사
    const yearsToRetire = Math.max(0, retireAge - currentAge);
    const yearsInRetirement = Math.max(0, deathAge - retireAge);

    if (currentAge >= retireAge) {
      alert("현재 나이는 은퇴 나이보다 적어야 합니다.");
      return;
    }
    if (retireAge >= deathAge) {
      alert("은퇴 나이는 기대 수명보다 적어야 합니다.");
      return;
    }

    // 2. 필요 월 소득 계산
    const netGapMonthly = Math.max(0, targetMonthly - expectedPension);

    // 3. 은퇴 시점의 필요 월 생활비 (FV)
    const inflationFactor = Math.pow(1 + inflationRate / 100, yearsToRetire);
    const requiredMonthlyFuture = netGapMonthly * inflationFactor;

    // 4. 은퇴 시점에 필요한 총 자산 (Nest Egg)
    const realReturnRate =
      (1 + safeReturnRate / 100) / (1 + inflationRate / 100) - 1;
    const monthlyRealRate = realReturnRate / 12;
    const monthsInRetirement = yearsInRetirement * 12;

    let totalNeededAtRetire = 0;
    if (Math.abs(monthlyRealRate) < 0.000001) {
      totalNeededAtRetire = requiredMonthlyFuture * monthsInRetirement;
    } else {
      totalNeededAtRetire =
        requiredMonthlyFuture *
        ((1 - Math.pow(1 + monthlyRealRate, -monthsInRetirement)) /
          monthlyRealRate) *
        (1 + monthlyRealRate);
    }

    // 5. 현재 자산의 미래 가치
    const monthlyReturnPre = returnRate / 100 / 12;
    const monthsToRetire = yearsToRetire * 12;

    const fvCurrentAssets =
      currentAssets * Math.pow(1 + monthlyReturnPre, monthsToRetire);

    // 6. 현재 월 저축액의 미래 가치
    let fvMonthlySavings = 0;
    if (Math.abs(monthlyReturnPre) < 0.000001) {
      fvMonthlySavings = monthlySaving * monthsToRetire;
    } else {
      fvMonthlySavings =
        monthlySaving *
        ((Math.pow(1 + monthlyReturnPre, monthsToRetire) - 1) /
          monthlyReturnPre);
    }

    // 7. 결과 종합
    const totalPrepared = fvCurrentAssets + fvMonthlySavings;
    const shortfall = totalNeededAtRetire - totalPrepared;

    // 8. 추가 필요 저축액
    let additionalMonthlyNeeded = 0;
    if (shortfall > 0 && monthsToRetire > 0) {
      if (Math.abs(monthlyReturnPre) < 0.000001) {
        additionalMonthlyNeeded = shortfall / monthsToRetire;
      } else {
        additionalMonthlyNeeded =
          (shortfall * monthlyReturnPre) /
          (Math.pow(1 + monthlyReturnPre, monthsToRetire) - 1);
      }
    }

    setResult({
      yearsToRetire,
      yearsInRetirement,
      requiredMonthlyFuture,
      totalNeededAtRetire,
      totalPrepared,
      shortfall,
      additionalMonthlyNeeded,
      inflationFactor,
    });
  };

  // [Chart Data]
  const getChartData = () => {
    if (!result || result.yearsToRetire <= 0) return null;

    const labels = [];
    const neededData = [];
    const preparedData = [];
    const steps = result.yearsToRetire;

    for (let i = 0; i <= steps; i++) {
      const year = new Date().getFullYear() + i;
      labels.push(year + "년");

      const months = i * 12;
      const r = inputs.returnRate / 100 / 12;

      // Prepared
      const fvAsset = inputs.currentAssets * Math.pow(1 + r, months);
      let fvSave = 0;
      if (r === 0) fvSave = inputs.monthlySaving * months;
      else fvSave = inputs.monthlySaving * ((Math.pow(1 + r, months) - 1) / r);
      preparedData.push(Math.round(fvAsset + fvSave));

      // Ideal
      const totalMonthlyNeeded =
        inputs.monthlySaving + result.additionalMonthlyNeeded;
      let fvTargetSave = 0;
      if (r === 0) fvTargetSave = totalMonthlyNeeded * months;
      else
        fvTargetSave = totalMonthlyNeeded * ((Math.pow(1 + r, months) - 1) / r);
      neededData.push(Math.round(fvAsset + fvTargetSave));
    }

    return {
      labels,
      datasets: [
        {
          label: "목표 달성 궤적 (Ideal)",
          data: neededData,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: "현재 예상 궤적",
          data: preparedData,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  };

  const totalLife = inputs.deathAge;
  const currentWidth = (inputs.currentAge / totalLife) * 100;
  const workWidth = ((inputs.retireAge - inputs.currentAge) / totalLife) * 100;
  const retireWidth = ((inputs.deathAge - inputs.retireAge) / totalLife) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
          <TrendingUp className="text-primary-600" size={36} />
          노후 자금 진단
          <span className="text-xs bg-slate-900 text-white px-2 py-1 rounded-full">
            Pro Simulation
          </span>
        </h2>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
          물가상승률과 투자수익률을 정밀 반영하여, 은퇴 시점에 필요한{" "}
          <strong>실질 자금</strong>을 계산합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2">
              <Info size={20} className="text-slate-500" /> 라이프 타임라인
            </h3>

            <div className="space-y-6">
              {/* 시각적 타임라인 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex h-3 rounded-full overflow-hidden mb-3 bg-slate-200">
                  <div
                    style={{ width: `${currentWidth}%` }}
                    className="bg-slate-400 transition-all duration-500"
                  ></div>
                  <div
                    style={{ width: `${workWidth}%` }}
                    className="bg-blue-500 transition-all duration-500"
                  ></div>
                  <div
                    style={{ width: `${retireWidth}%` }}
                    className="bg-orange-400 transition-all duration-500"
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  <span>0세</span>
                  <span className="text-blue-600">
                    준비기간 (
                    {Math.max(0, inputs.retireAge - inputs.currentAge)}년)
                  </span>
                  <span className="text-orange-500">
                    은퇴생활 ({Math.max(0, inputs.deathAge - inputs.retireAge)}
                    년)
                  </span>
                  <span>{inputs.deathAge}세</span>
                </div>
              </div>

              {/* 연령 컨트롤러 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 pl-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-600 whitespace-nowrap">
                      현재 나이
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStepper("currentAge", -1)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-bold text-slate-800 whitespace-nowrap">
                      {inputs.currentAge}세
                    </span>
                    <button
                      onClick={() => handleStepper("currentAge", 1)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-blue-100 bg-blue-50/50">
                  <div className="flex items-center gap-2 pl-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Briefcase size={16} />
                    </div>
                    <span className="text-sm font-bold text-blue-700 whitespace-nowrap">
                      은퇴 나이
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStepper("retireAge", -1)}
                      className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-bold text-blue-700 whitespace-nowrap">
                      {inputs.retireAge}세
                    </span>
                    <button
                      onClick={() => handleStepper("retireAge", 1)}
                      className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-orange-100 bg-orange-50/50">
                  <div className="flex items-center gap-2 pl-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                      <Sunset size={16} />
                    </div>
                    <span className="text-sm font-bold text-orange-700 whitespace-nowrap">
                      기대 수명
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStepper("deathAge", -1)}
                      className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded-full transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-bold text-orange-700 whitespace-nowrap">
                      {inputs.deathAge}세
                    </span>
                    <button
                      onClick={() => handleStepper("deathAge", 1)}
                      className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded-full transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 목표 설정 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <Target size={16} /> 은퇴 목표 (현재가치)
                </label>
                <div className="space-y-3">
                  {/* 희망 월 생활비 */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-500">
                        희망 월 생활비
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden px-2">
                        <button
                          onClick={() => handleStepper("targetMonthly", -10)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          name="targetMonthly"
                          value={inputs.targetMonthly}
                          onChange={handleChange}
                          className="w-full p-2 text-center font-bold outline-none"
                        />
                        <button
                          onClick={() => handleStepper("targetMonthly", 10)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-600 w-8 whitespace-nowrap">
                        만원
                      </span>
                    </div>
                  </div>

                  {/* 예상 공적연금 */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-500">
                        예상 공적연금 (국민+기초)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden px-2">
                        <button
                          onClick={() => handleStepper("expectedPension", -10)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          name="expectedPension"
                          value={inputs.expectedPension}
                          onChange={handleChange}
                          className="w-full p-2 text-center font-bold outline-none bg-transparent"
                        />
                        <button
                          onClick={() => handleStepper("expectedPension", 10)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-600 w-8 whitespace-nowrap">
                        만원
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-right">
                      * 공적연금은 물가상승이 반영되므로 현재가치 입력
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 자산 현황 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <PiggyBank size={16} /> 자산 현황
                </label>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 whitespace-nowrap">
                      현재 모은 노후자금
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="currentAssets"
                        value={inputs.currentAssets}
                        onChange={handleChange}
                        className="w-28 p-2 border rounded-lg text-right outline-none font-bold"
                      />
                      <span className="text-sm text-slate-500 whitespace-nowrap">
                        만원
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 whitespace-nowrap">
                      월 저축 가능액
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="monthlySaving"
                        value={inputs.monthlySaving}
                        onChange={handleChange}
                        className="w-28 p-2 border rounded-lg text-right outline-none font-bold"
                      />
                      <span className="text-sm text-slate-500 whitespace-nowrap">
                        만원
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 가정 변수 (Sliders) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>투자 수익률 (은퇴 전)</span>
                    <span className="text-primary-600">
                      {inputs.returnRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    name="returnRate"
                    min="1"
                    max="10"
                    step="0.5"
                    value={inputs.returnRate}
                    onChange={handleChange}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>물가 상승률 (인플레이션)</span>
                    <span className="text-red-500">
                      {inputs.inflationRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    name="inflationRate"
                    min="0"
                    max="5"
                    step="0.1"
                    value={inputs.inflationRate}
                    onChange={handleChange}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-red-500"
                  />
                </div>
              </div>

              <button
                onClick={calculateRetirementPlan}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Activity size={20} /> 노후 준비상태 진단
              </button>
            </div>
          </div>
          <div className="bg-slate-100 rounded-lg h-24 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200">
            <AdSense
              slot="1430553892"
              label="Main Top Banner"
              style={{ marginBottom: "3rem" }}
            />
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="md:col-span-7">
          {result ? (
            <div className="space-y-6 animate-fade-in-up">
              {/* 1. Key Message Card */}
              <div
                className={`p-6 rounded-2xl shadow-xl border-2 transition-all ${result.shortfall <= 0 ? "bg-white border-green-500 shadow-green-100" : "bg-white border-red-400 shadow-red-100"}`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="text-slate-500 text-sm font-bold mb-1 flex items-center gap-1">
                      {result.shortfall <= 0 ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <AlertTriangle size={16} className="text-red-500" />
                      )}
                      진단 결과
                    </h3>
                    <p className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
                      {result.shortfall <= 0 ? (
                        <span className="text-green-600">
                          노후 준비가 완벽합니다!
                        </span>
                      ) : (
                        <span>
                          매월{" "}
                          <span className="text-red-500 whitespace-nowrap">
                            {Math.round(
                              result.additionalMonthlyNeeded,
                            ).toLocaleString()}
                            만원
                          </span>
                          을<br />더 저축해야 합니다.
                        </span>
                      )}
                    </p>
                  </div>
                  {result.shortfall > 0 && (
                    <div className="bg-red-50 px-4 py-3 rounded-xl text-right border border-red-100 w-full md:w-auto">
                      <p className="text-xs text-red-500 font-bold mb-1">
                        부족한 노후자금 ({inputs.retireAge}세 기준)
                      </p>
                      <p className="text-xl font-black text-red-600 whitespace-nowrap">
                        -{Math.round(result.shortfall / 10000).toLocaleString()}
                        억원
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Reality Check (Inflation) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <WonSign size={60} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                    물가상승의 위협
                  </h4>
                  <div className="flex items-end gap-2">
                    <div>
                      {/* [FIXED] whitespace-nowrap */}
                      <p className="text-xs text-slate-400 whitespace-nowrap">
                        현재 가치
                      </p>
                      <p className="text-lg font-bold text-slate-700 whitespace-nowrap">
                        {Math.max(
                          0,
                          inputs.targetMonthly - inputs.expectedPension,
                        ).toLocaleString()}
                        만원
                      </p>
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-slate-300 mb-1 shrink-0"
                    />
                    <div>
                      {/* [FIXED] whitespace-nowrap */}
                      <p className="text-xs text-red-500 font-bold whitespace-nowrap">
                        {result.yearsToRetire}년 뒤 (은퇴시점)
                      </p>
                      <p className="text-2xl font-black text-red-600 whitespace-nowrap">
                        {Math.round(
                          result.requiredMonthlyFuture,
                        ).toLocaleString()}
                        만원
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    물가상승률 {inputs.inflationRate}% 가정 시, 구매력을
                    유지하려면 {result.inflationFactor.toFixed(1)}배의 돈이
                    필요합니다.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <PiggyBank size={60} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                    필요한 총 은퇴자금 (Nest Egg)
                  </h4>
                  {/* [FIXED] whitespace-nowrap */}
                  <p className="text-3xl font-black text-slate-800 tracking-tight whitespace-nowrap">
                    {Math.round(
                      result.totalNeededAtRetire / 10000,
                    ).toLocaleString()}
                    억{" "}
                    <span className="text-xl">
                      {Math.round(
                        result.totalNeededAtRetire % 10000,
                      ).toLocaleString()}
                      만원
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {inputs.retireAge}세부터 {inputs.deathAge}세까지 연금을
                    제외한 부족분을 메우기 위해 은퇴 시점에 딱 쥐고 있어야 할
                    목돈입니다.
                  </p>
                </div>
              </div>

              {/* 3. Chart */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} /> 자산 축적 시뮬레이션
                </h4>
                <div className="h-64">
                  <Line
                    data={getChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: { mode: "index", intersect: false },
                      scales: {
                        y: {
                          grid: { color: "#f1f5f9" },
                          ticks: { callback: (value) => value / 10000 + "억" },
                        },
                        x: { grid: { display: false } },
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (context) =>
                              `${context.dataset.label}: ${context.raw.toLocaleString()}만원`,
                          },
                        },
                      },
                    }}
                  />
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-slate-600">현재 저축 유지 시</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-700">
                      목표 달성 궤적 (권장)
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Action Plan */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex gap-5 items-start">
                <Clock className="text-yellow-400 shrink-0 mt-1" size={28} />
                <div>
                  <h4 className="font-bold text-lg mb-2">Top Tier 솔루션</h4>
                  <div className="text-sm text-slate-300 leading-relaxed space-y-2">
                    <p>
                      현재 <strong>{inputs.currentAge}세</strong>인 고객님이{" "}
                      <strong>{inputs.retireAge}세</strong>에 은퇴하여 월{" "}
                      <strong>{inputs.targetMonthly}만원</strong>{" "}
                      수준(현재가치)의 삶을 누리시려면, 공적연금을 제외하고도
                      은퇴 시점에 약{" "}
                      <strong>
                        {Math.round(
                          result.totalNeededAtRetire / 10000,
                        ).toLocaleString()}
                        억원
                      </strong>
                      이 필요합니다.
                    </p>
                    {result.shortfall > 0 ? (
                      <p>
                        현재 저축액({inputs.monthlySaving}만원)으로는 약{" "}
                        <strong>
                          {Math.round(
                            result.shortfall / 10000,
                          ).toLocaleString()}
                          억원
                        </strong>
                        이 부족할 것으로 예상됩니다.
                        <br />
                        <span className="text-yellow-400 font-bold">
                          👉 해결책: 월 저축액을{" "}
                          {Math.round(
                            inputs.monthlySaving +
                              result.additionalMonthlyNeeded,
                          ).toLocaleString()}
                          만원으로 늘리거나, 투자 수익률을{" "}
                          {inputs.returnRate + 2}% 이상으로 높여야 합니다.
                        </span>
                      </p>
                    ) : (
                      <p className="text-green-400 font-bold">
                        현재의 저축 습관과 자산 운용을 유지하시면 여유로운
                        노후가 예상됩니다. 축하드립니다! 🎉
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-10 min-h-[300px]">
              <Target size={64} className="mb-6 opacity-20 text-slate-900" />
              <p className="text-center text-slate-500 font-medium">
                좌측에 현재 자산과 목표를 입력하면
                <br />
                노후 준비 상태와 필요 저축액을
                <br />
                <span className="text-slate-800 font-bold">
                  인플레이션을 반영하여
                </span>{" "}
                진단합니다.
              </p>
            </div>
          )}
          <AdSense
            slot="2372100479"
            label="Main Top Banner"
            style={{ marginBottom: "3rem" }}
          />
        </div>
      </div>
    </div>
  );
};

export default TargetPensionPage;
