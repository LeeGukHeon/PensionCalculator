/**
 * src/utils/pensionPolicyData.js
 * [2026 Reform Standard] 연금개혁안 및 최신 감액 기준 반영
 */

export const NPS_CONSTANTS = {
  A_VALUE_2026: 3193511,

  // [Reform] 소득대체율: 기존 40% 하락안 폐기 -> 42% 수준 유지/상향 (개혁안 반영)
  INCOME_REPLACEMENT_RATE_2026: 0.42,

  MAX_INCOME: 6170000,
  MIN_INCOME: 390000,

  // [Reform] 보험료율 인상 스케줄 (2026년부터 13%까지 점진 증액)
  PREMIUM_RATE_SCHEDULE: {
    2025: 0.09,
    2026: 0.095,
    2027: 0.1,
    2028: 0.105,
    2029: 0.11,
    2030: 0.115,
    2031: 0.12,
    2032: 0.125,
    2033: 0.13, // 최종 13%
  },
};

export const REVALUATION_TABLE = {
  1988: 7.64,
  1989: 7.24,
  1990: 6.78,
  1991: 6.18,
  1992: 5.82,
  1993: 5.56,
  1994: 5.23,
  1995: 4.96,
  1996: 4.72,
  1997: 4.51,
  1998: 4.19,
  1999: 4.16,
  2000: 3.97,
  2001: 3.82,
  2002: 3.65,
  2003: 3.51,
  2004: 3.39,
  2005: 3.28,
  2006: 3.19,
  2007: 3.1,
  2008: 3.01,
  2009: 2.91,
  2010: 2.82,
  2011: 2.74,
  2012: 2.63,
  2013: 2.57,
  2014: 2.54,
  2015: 2.52,
  2016: 2.5,
  2017: 2.45,
  2018: 2.41,
  2019: 2.37,
  2020: 2.36,
  2021: 2.35,
  2022: 2.29,
  2023: 2.17,
  2024: 2.05,
  2025: 1.025,
  2026: 1.0,
};

export const CREDIT_CONSTANTS = {
  MILITARY_MONTHS: 12,
  CHILDBIRTH_1ST: 12,
  CHILDBIRTH_2ND: 12,
  CHILDBIRTH_3RD_PLUS: 18,

  DEFER_YEARLY_RATE: 0.072, // 연기 +7.2%
  EARLY_YEARLY_RATE: 0.06, // 조기 -6.0%
};

// [NEW] 부양가족연금 (2026 추정치: 물가상승 반영)
export const DEPENDENT_PENSION = {
  SPOUSE: 306000, // 배우자 (연)
  CHILD_PARENT: 203000, // 자녀/부모 (연)
};

// [NEW] 재직자 감액 기준 (2026 개정: A값 + 200만원)
export const WORKING_CUT_LIMIT = 5090000; // 약 509만원

// [Corrected] 2026년 기초연금 확정 기준 반영
export const BASIC_PENSION_CONSTANTS = {
  // 1. 선정기준액
  LIMIT_SINGLE: 2470000, // 단독가구 247만원
  LIMIT_COUPLE: 3952000, // 부부가구 395.2만원

  // 2. 기준연금액 (최대 지급액)
  FULL_AMOUNT: 349700, // 월 34만 9,700원

  // 3. 근로소득 기본공제액 (2026년 인상분 반영)
  EARNED_INCOME_DEDUCTION: 1180000,

  // 4. 지역별 주거 재산 공제액
  DEDUCTION_HOUSE: {
    METRO: 135000000,
    CITY: 85000000,
    RURAL: 72500000,
  },

  // 5. 금융재산 공제
  DEDUCTION_FINANCE: 20000000,

  // 6. 소득환산율 (연 4% / 12개월)
  CONVERSION_RATE: 0.04 / 12,

  // 7. 고급 자동차/회원권 기준
  LUXURY_CAR_PRICE: 40000000,
};

export const TAX_CONSTANTS = { MAX_DEDUCTION_LIMIT: 9000000 };

export const ECONOMY_CONSTANTS = {
  INFLATION_RATE: 0.025,
  INVESTMENT_RETURN_RATE: 0.05,
};
