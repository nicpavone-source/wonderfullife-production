"use client";

import Script from "next/script";

export default function AnalyticsScripts() {
  const ga = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const googleAds = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const clarity = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  // Load gtag.js only once.
  // Prefer GA4 as the loader ID if available; otherwise use Google Ads.
  const googleTagId = ga || googleAds;

  return (
    <>
      {googleTagId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
            strategy="afterInteractive"
          />

          <Script id="google-tag" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

            gtag('js', new Date());

            ${ga ? `gtag('config', '${ga}');` : ""}
            ${googleAds ? `gtag('config', '${googleAds}');` : ""}
          `}</Script>
        </>
      ) : null}

      {clarity ? (
        <Script id="clarity" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){
              (c[a].q=c[a].q||[]).push(arguments)
            };
            t=l.createElement(r);
            t.async=1;
            t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarity}");
        `}</Script>
      ) : null}
    </>
  );
}