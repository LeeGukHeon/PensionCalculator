/**
 * src/utils/pensionCalculations.js
 * [Final Engine V4.4]
 * 509만원 감액 기준, 13% 보험료 인상, 42% 소득대체율 완벽 적용
 */

import {
  NPS_CONSTANTS,
  TAX_CONSTANTS,
  ECONOMY_CONSTANTS,
  REVALUATION_TABLE,
  CREDIT_CONSTANTS,
  DEPENDENT_PENSION,
  WORKING_CUT_LIMIT,
} from "./pensionPolicyData";

const getReplacementRate = (year) => {
  if (year < 1999) return 0.7;
  if (year >= 1999 && year <= 2007) return 0.6;
  if (year === 2008) return 0.5;
  if (year >= 2009 && year <= 2025) return 0.5 - (year - 2008) * 0.005;
  return NPS_CONSTANTS.INCOME_REPLACEMENT_RATE_2026;
};

const getPremiumRate = (year) => {
  if (year < 2026) return 0.09;
  return NPS_CONSTANTS.PREMIUM_RATE_SCHEDULE[year] || 0.13;
};

export const calculateDetailedPeriod = (
  birthDateStr,
  startYear,
  startMonth,
  retireAge,
) => {
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  const retireYear = birthDate.getFullYear() + retireAge;
  const retireMonth = birthDate.getMonth() + 1;
  const startTotal = startYear * 12 + startMonth;
  const endTotal = retireYear * 12 + retireMonth;
  const totalMonths = Math.max(0, endTotal - startTotal);

  return {
    currentAge: age,
    totalMonths,
    retireYear,
    startYear,
    startMonth,
    retireMonth,
  };
};

export const calculateNationalPension = (inputs, periodData) => {
  const { startYear, startMonth, retireYear, retireMonth } = periodData;
  const currentYear = new Date().getFullYear();
  const SYSTEM_START_YEAR = 1988;
  const effectiveStartYear = Math.max(startYear, SYSTEM_START_YEAR);

  const initialSalary = inputs.initialSalary * 10000;
  const currentSalary = inputs.monthlyIncome * 10000;
  const wageGrowthRate = inputs.wageGrowthRate / 100;
  const excludedPeriods = inputs.excludedPeriods || [];

  const hasMilitary = inputs.hasMilitary || false;
  const childCount = inputs.childCount || 0;
  const deferYears = inputs.deferYears || 0;
  const earlyYears = inputs.earlyYears || 0;

  const depSpouse = inputs.depSpouse || false;
  const depChildren = inputs.depChildren || 0;
  const depParents = inputs.depParents || 0;

  // [Check] 단위 주의: UI에서 만원 단위로 입력받아 여기서 10000을 곱함
  const postRetireIncome = (inputs.postRetireIncome || 0) * 10000;

  let totalRevaluedIncome = 0;
  let totalPaidMonths = 0;
  let totalPensionYearly = 0;

  let totalPaybackCost = 0;
  let totalPaybackMonths = 0;
  let totalFuturePremium = 0;

  // --- 1. 기본 연금 산정 ---
  for (let year = effectiveStartYear; year <= retireYear; year++) {
    const salaryPeakYear = periodData.retireYear - 5;

    let estimatedMonthlyIncome = 0;
    if (year <= currentYear) {
      if (currentYear === effectiveStartYear) {
        estimatedMonthlyIncome = currentSalary;
      } else {
        const progress =
          (year - effectiveStartYear) / (currentYear - effectiveStartYear);
        estimatedMonthlyIncome =
          initialSalary + (currentSalary - initialSalary) * progress;
      }
    } else {
      if (year > salaryPeakYear) {
        const peakIncomeYear = Math.max(currentYear, salaryPeakYear);
        const futureYearsToPeak = peakIncomeYear - currentYear;
        estimatedMonthlyIncome =
          currentSalary *
          Math.pow(1 + wageGrowthRate, Math.max(0, futureYearsToPeak));
      } else {
        const futureYears = year - currentYear;
        estimatedMonthlyIncome =
          currentSalary * Math.pow(1 + wageGrowthRate, futureYears);
      }
    }

    if (estimatedMonthlyIncome > NPS_CONSTANTS.MAX_INCOME)
      estimatedMonthlyIncome = NPS_CONSTANTS.MAX_INCOME;
    if (estimatedMonthlyIncome < NPS_CONSTANTS.MIN_INCOME)
      estimatedMonthlyIncome = NPS_CONSTANTS.MIN_INCOME;

    const revaluationFactor = REVALUATION_TABLE[year] || 1.0;
    const revaluedIncome = estimatedMonthlyIncome * revaluationFactor;
    const currentPremiumRate = getPremiumRate(year);

    let validMonthsInThisYear = 0;
    let incomeSumInThisYear = 0;

    for (let m = 1; m <= 12; m++) {
      if (year === startYear && m < startMonth) continue;
      if (year === retireYear && m >= retireMonth) continue;
      if (year < SYSTEM_START_YEAR) continue;

      const currentMonthVal = year * 12 + m;
      let isExcluded = false;
      let isPayback = false;

      for (const p of excludedPeriods) {
        const pStart = p.startYear * 12 + p.startMonth;
        const pEnd = p.endYear * 12 + p.endMonth;
        if (currentMonthVal >= pStart && currentMonthVal <= pEnd) {
          isExcluded = true;
          if (p.isPayback) isPayback = true;
          break;
        }
      }

      if (!isExcluded) {
        validMonthsInThisYear++;
        incomeSumInThisYear += revaluedIncome;
        if (year > currentYear) {
          totalFuturePremium += estimatedMonthlyIncome * currentPremiumRate;
        }
      } else if (isPayback) {
        validMonthsInThisYear++;
        let paybackIncomeBase = currentSalary;
        if (paybackIncomeBase > NPS_CONSTANTS.MAX_INCOME)
          paybackIncomeBase = NPS_CONSTANTS.MAX_INCOME;
        incomeSumInThisYear += paybackIncomeBase;

        const paybackRate = getPremiumRate(
          currentYear < 2026 ? 2026 : currentYear,
        );
        totalPaybackCost += paybackIncomeBase * paybackRate;
        totalPaybackMonths++;
      }
    }

    if (validMonthsInThisYear <= 0) continue;

    totalRevaluedIncome += incomeSumInThisYear;
    totalPaidMonths += validMonthsInThisYear;
  }

  const B_Final =
    totalPaidMonths > 0 ? totalRevaluedIncome / totalPaidMonths : 0;
  const A_Final = NPS_CONSTANTS.A_VALUE_2026;

  for (let year = effectiveStartYear; year <= retireYear; year++) {
    let validMonthsInThisYear = 0;
    for (let m = 1; m <= 12; m++) {
      if (year === startYear && m < startMonth) continue;
      if (year === retireYear && m >= retireMonth) continue;
      if (year < SYSTEM_START_YEAR) continue;
      const currentMonthVal = year * 12 + m;
      let isExcluded = false;
      let isPayback = false;
      for (const p of excludedPeriods) {
        const pStart = p.startYear * 12 + p.startMonth;
        const pEnd = p.endYear * 12 + p.endMonth;
        if (currentMonthVal >= pStart && currentMonthVal <= pEnd) {
          isExcluded = true;
          if (p.isPayback) isPayback = true;
          break;
        }
      }
      if (!isExcluded || isPayback) validMonthsInThisYear++;
    }
    if (validMonthsInThisYear <= 0) continue;

    const rate = getReplacementRate(year);
    const yearPension =
      ((A_Final + B_Final) / 2) * rate * (validMonthsInThisYear / 480);
    totalPensionYearly += yearPension * 12;
  }

  // --- 2. 크레딧 ---
  let totalCreditMonths = 0;
  if (hasMilitary) totalCreditMonths += CREDIT_CONSTANTS.MILITARY_MONTHS;
  if (childCount >= 1) totalCreditMonths += CREDIT_CONSTANTS.CHILDBIRTH_1ST;
  if (childCount >= 2) totalCreditMonths += CREDIT_CONSTANTS.CHILDBIRTH_2ND;
  if (childCount >= 3)
    totalCreditMonths +=
      CREDIT_CONSTANTS.CHILDBIRTH_3RD_PLUS * (childCount - 2);

  const creditPensionYearly = A_Final * 0.42 * (totalCreditMonths / 480) * 12;
  let finalPensionYearly = totalPensionYearly + creditPensionYearly;

  // --- 3. 부양가족 ---
  let dependentAddOn = 0;
  if (depSpouse) dependentAddOn += DEPENDENT_PENSION.SPOUSE;
  dependentAddOn += depChildren * DEPENDENT_PENSION.CHILD_PARENT;
  dependentAddOn += depParents * DEPENDENT_PENSION.CHILD_PARENT;

  finalPensionYearly += dependentAddOn;

  // --- 4. 조기/연기 ---
  if (earlyYears > 0) {
    const reduction = earlyYears * CREDIT_CONSTANTS.EARLY_YEARLY_RATE;
    finalPensionYearly = finalPensionYearly * (1 - reduction);
  } else if (deferYears > 0) {
    finalPensionYearly -= dependentAddOn;
    const bonus = deferYears * CREDIT_CONSTANTS.DEFER_YEARLY_RATE;
    finalPensionYearly = finalPensionYearly * (1 + bonus);
    finalPensionYearly += dependentAddOn;
  }

  // --- 5. 재직자 감액 (Earnings Test) ---
  let earningsCutAmount = 0;
  // [Fix] 509만원 고정값 fallback (안전장치)
  const LIMIT = WORKING_CUT_LIMIT || 5090000;

  if (postRetireIncome > LIMIT) {
    const excessIncome = postRetireIncome - LIMIT;

    // 감액 구간 계산
    if (excessIncome < 1000000) earningsCutAmount = excessIncome * 0.05;
    else if (excessIncome < 2000000)
      earningsCutAmount = 50000 + (excessIncome - 1000000) * 0.1;
    else if (excessIncome < 3000000)
      earningsCutAmount = 150000 + (excessIncome - 2000000) * 0.15;
    else if (excessIncome < 4000000)
      earningsCutAmount = 300000 + (excessIncome - 3000000) * 0.2;
    else earningsCutAmount = 500000 + (excessIncome - 4000000) * 0.25;

    // 상한 적용
    if (earningsCutAmount > (finalPensionYearly / 12) * 0.5) {
      earningsCutAmount = (finalPensionYearly / 12) * 0.5;
    }

    finalPensionYearly -= earningsCutAmount * 12;
  } else {
    // 기준 미만이면 감액 0
    earningsCutAmount = 0;
  }

  if (totalPaidMonths < 120 && totalCreditMonths === 0)
    return { monthly: 0, yearly: 0, totalPaidMonths };

  return {
    monthly: Math.floor(finalPensionYearly / 12),
    yearly: Math.floor(finalPensionYearly),
    avgMonthlyIncome: Math.floor(B_Final),
    totalPaidMonths,
    totalCreditMonths,
    creditAmount: Math.floor(creditPensionYearly / 12),
    totalPaybackCost: Math.floor(totalPaybackCost),
    totalPaybackMonths,
    monthlyIncrease: 0,
    earningsCutAmount: Math.floor(earningsCutAmount),
    dependentAddOn: Math.floor(dependentAddOn),
    totalFuturePremium: Math.floor(totalFuturePremium),
  };
};

export const calculatePensionTax = (yearlyPension) => {
  let pensionDeduction = 0;
  if (yearlyPension <= 3500000) pensionDeduction = yearlyPension;
  else if (yearlyPension <= 7000000)
    pensionDeduction = 3500000 + (yearlyPension - 3500000) * 0.4;
  else if (yearlyPension <= 14000000)
    pensionDeduction = 3500000 + 1400000 + (yearlyPension - 7000000) * 0.2;
  else
    pensionDeduction =
      3500000 + 1400000 + 1400000 + (yearlyPension - 14000000) * 0.1;

  if (pensionDeduction > TAX_CONSTANTS.MAX_DEDUCTION_LIMIT)
    pensionDeduction = TAX_CONSTANTS.MAX_DEDUCTION_LIMIT;

  const pensionIncomeAmount = yearlyPension - pensionDeduction;
  const basicDeduction = 1500000;
  const taxBase = pensionIncomeAmount - basicDeduction;

  if (taxBase <= 0) return 0;

  let calculatedTax = 0;
  if (taxBase <= 14000000) calculatedTax = taxBase * 0.06;
  else if (taxBase <= 50000000) calculatedTax = taxBase * 0.15 - 1260000;
  else if (taxBase <= 88000000) calculatedTax = taxBase * 0.24 - 5760000;
  else calculatedTax = taxBase * 0.35 - 15440000;

  return Math.floor(calculatedTax * 1.1);
};

export const calculateFutureValue = (amount, years) => {
  const rate = ECONOMY_CONSTANTS.INFLATION_RATE;
  return Math.floor(amount * Math.pow(1 + rate, years));
};
