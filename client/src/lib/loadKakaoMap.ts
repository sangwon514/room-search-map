// src/lib/loadKakaoMap.ts
export const loadKakaoMap = () => {
    return new Promise<void>((resolve, reject) => {
      if (document.getElementById("kakao-map-sdk")) {
        resolve();
        return;
      }
  
      const script = document.createElement("script");
      script.id = "kakao-map-sdk";
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false&libraries=clusterer,services`;
      script.onload = () => {
        window.kakao.maps.load(() => {
          resolve();
        });
      };
      script.onerror = reject;
  
      document.head.appendChild(script);
    });
  };
  