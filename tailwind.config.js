/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6", // 국민연금 시그니처 블루
          600: "#2563eb",
          700: "#1d4ed8",
        },
        secondary: {
          500: "#10b981", // 긍정/수익률 그린
        },
        slate: {
          800: "#1e293b", // 텍스트 메인
          500: "#64748b", // 텍스트 서브
        },
      },
      fontFamily: {
        sans: ["Pretendard", "sans-serif"], // Pretendard 폰트 사용 권장
      },
    },
  },
  plugins: [],
};
