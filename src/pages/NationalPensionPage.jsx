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

const NationalPensionPage = () => {
  const [inputs, setInputs] = useState({
    birthDate: "1998-01-05",
    startYear: 2024,
    startMonth: 1,
    retireAge: 60,
    monthlyIncome: 300,
    initialSalary: 250,
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

  const [result, setResult] = useState(null);
  const [showTax, setShowTax] = useState(false);

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

  const handleCalculate = () => {
    if (!inputs.birthDate) {
      alert("생년월일을 입력해주세요.");
      return;
    }

    const periodData = calculateDetailedPeriod(
      inputs.birthDate,
      inputs.startYear,
      inputs.startMonth,
      inputs.retireAge,
    );

    const pension = calculateNationalPension(inputs, periodData);

    if (pension.totalPaidMonths < 120 && pension.totalCreditMonths === 0) {
      alert("납부 기간이 부족합니다 (최소 10년).");
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
      };
      const baseResult = calculateNationalPension(noPaybackInputs, periodData);
      monthlyIncrease = pension.monthly - baseResult.monthly;
    }

    setResult({
      periodYear: Math.floor(pension.totalPaidMonths / 12),
      periodMonth: pension.totalPaidMonths % 12,
      startYear: periodData.retireYear + (receiptAge - inputs.retireAge),
      currentAge: periodData.currentAge,
      avgIncome: pension.avgMonthlyIncome,
      creditAmount: pension.creditAmount,
      earningsCutAmount: pension.earningsCutAmount,
      dependentAddOn: pension.dependentAddOn,
      paybackCost: pension.totalPaybackCost,
      paybackMonths: pension.totalPaybackMonths,
      monthlyIncrease: monthlyIncrease,
      currentValue: {
        monthly: pension.monthly,
        monthlyAfterTax: pension.monthly - monthlyTax,
        tax: monthlyTax,
      },
      futureValue: {
        monthly: futureMonthly,
        monthlyAfterTax:
          futureMonthly - calculateFutureValue(monthlyTax, yearsUntilReceipt),
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
          보험료율 인상(9.5%~13%), 소득대체율 42%, 재직자 감액 완화 등{" "}
          <strong>2026 연금개혁안</strong>이 완벽 적용된 버전입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2">
              <Info size={20} className="text-slate-500" /> 필수 정보 입력
            </h3>

            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Calendar size={16} /> 생년월일
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={inputs.birthDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Briefcase size={16} /> 납부 시작 시기
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="startYear"
                    value={inputs.startYear}
                    onChange={handleChange}
                    className="w-24 p-3 border border-slate-300 rounded-lg outline-none text-center focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="2024"
                  />
                  <select
                    name="startMonth"
                    value={inputs.startMonth}
                    onChange={handleChange}
                    className="flex-1 p-3 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {m}월
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 소득 흐름 */}
              <h4 className="font-bold text-sm text-primary-700 mb-3 flex items-center gap-1">
                <WonSign size={16} /> 소득 흐름 (만원 단위)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    가입 당시 소득
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
                    현재 월 소득
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

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <BarChart2 size={16} /> 연평균 임금상승률
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

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 납부 예외 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-700 flex items-center gap-1">
                    <AlertCircle size={16} /> 납부 예외 / 추납
                  </label>
                  <button
                    onClick={addExcludedPeriod}
                    className="text-xs flex items-center gap-1 text-primary-600 font-bold hover:text-primary-800 bg-primary-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <PlusCircle size={14} /> 구간 추가
                  </button>
                </div>
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
                      <span>경력단절 기간이 있다면 추가하세요.</span>
                      <span className="text-[10px] opacity-70">
                        (추납 효율을 분석해드립니다)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* 부양가족 연금 가산 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <Users size={16} /> 부양가족 (연금 가산)
                </label>
                <div className="flex flex-col gap-3">
                  {/* 배우자 카드 */}
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

                  {/* 자녀 & 부모 Stepper UI */}
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
                          <Plus size={14} />
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

              {/* [NEW] 크레딧 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <Medal size={16} /> 2026 크레딧 혜택
                </label>
                <div className="flex flex-col gap-3">
                  {/* 군복무 카드 */}
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

                  {/* 출산 크레딧 Stepper */}
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

              {/* [FIXED] 재직자 감액 입력란 */}
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
                정밀 시뮬레이션 시작
              </button>
            </div>
          </div>

          <AdSense
            slot="3685182143"
            label="Main Top Banner"
            style={{ marginBottom: "3rem" }}
          />
        </div>

        {/* Right Side: Result Display */}
        <div className="md:col-span-7">
          {result ? (
            <div className="space-y-6 animate-fade-in-up">
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
                    {/* 배지들 */}
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

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mb-4 text-sm border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      생애 평균 소득(B값)
                    </p>
                    <p className="font-bold text-slate-800">
                      {result.avgIncome.toLocaleString()}원
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
                        result.creditAmount * 12 +
                        result.dependentAddOn
                      ).toLocaleString()}
                      원
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">재직자 감액</p>
                    {result.earningsCutAmount > 0 ? (
                      <p className="font-bold text-red-500">
                        월 -{result.earningsCutAmount.toLocaleString()}원
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
                          {result.paybackCost.toLocaleString()}원
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-indigo-500 mb-1">
                          월 수령액 증가
                        </p>
                        <p className="font-bold text-indigo-900">
                          +{result.monthlyIncrease.toLocaleString()}원
                        </p>
                      </div>
                      <div className="col-span-2 text-xs text-indigo-700 mt-1 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm leading-relaxed">
                        💡{" "}
                        <strong>
                          {(
                            result.paybackCost /
                            result.monthlyIncrease /
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
                        y: {
                          beginAtZero: true,
                          grid: { color: "#f1f5f9" },
                        },
                        x: {
                          grid: { display: false },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg flex gap-4 items-start">
                <TrendingUp
                  className="text-green-400 shrink-0 mt-1"
                  size={24}
                />
                <div>
                  <h4 className="font-bold text-lg mb-1">
                    Top Tier 분석 리포트
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    2026년 연금개혁안(보험료 인상, 소득대체율 42% 상향)이
                    적용되었습니다.
                    <br />
                    <br />
                    {result.earningsCutAmount > 0 ? (
                      <span>
                        ⚠️ 은퇴 후 소득(약{" "}
                        {inputs.postRetireIncome.toLocaleString()}만원)으로 인해
                        재직자 감액이 발생하고 있습니다.{" "}
                        <span className="text-yellow-400 font-bold underline cursor-pointer">
                          연기연금
                        </span>{" "}
                        신청을 통해 감액을 피하고 연금액을 늘리는 것을
                        추천합니다.
                      </span>
                    ) : (
                      <span>
                        ✅ 재직자 감액 기준(509만원) 미만이므로 일하셔도 연금이
                        깎이지 않습니다. 소득 활동을 계속하시는 것이 유리합니다.
                      </span>
                    )}
                  </p>
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
