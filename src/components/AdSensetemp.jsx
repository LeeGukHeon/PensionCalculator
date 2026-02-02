import { useEffect } from "react";

function AdSense({ slot, format = "auto", style = {}, label = "광고" }) {
  useEffect(() => {
    // 배포 환경(production)에서만 광고 스크립트 실행
    try {
      if (window.adsbygoogle && import.meta.env.PROD) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  const isDev = import.meta.env.DEV;

  return (
    <div
      className="adsense-wrapper"
      style={{
        margin: "2rem 0",
        textAlign: "center",
        minHeight: "100px",
        backgroundColor: isDev ? "#f0f0f0" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: isDev ? "1px dashed #ccc" : "none",
        ...style,
      }}
    >
      {isDev ? (
        <span style={{ color: "#999", fontSize: "0.8rem" }}>
          Google AdSense 영역 ({label})<br />
          (Slot: {slot})
        </span>
      ) : (
        <ins
          className="adsbygoogle"
          style={{ display: "block", ...style }}
          data-ad-client="ca-pub-4285543298552704" /* 본인의 게시자 ID로 교체 필수 파일명 변경*/
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        ></ins>
      )}
    </div>
  );
}

export default AdSense;
