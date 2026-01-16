"use client";

import { useEffect, useState } from "react";

export default function LanguageTranslator() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    (window as any).googleTranslateElementInit = () => {
      const googleTranslate = (window as any).google?.translate;
      if (!googleTranslate?.TranslateElement) return;

      new googleTranslate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element"
      );

      const interval = setInterval(() => {
        const select =
          document.querySelector<HTMLSelectElement>(".goog-te-combo");
        if (select) {
          setReady(true);
          clearInterval(interval);
        }
      }, 300);
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!ready) return;

    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (!select) return;

    select.value = e.target.value;
    select.dispatchEvent(new Event("change"));
  };

  return (
    <>
      <div id="google_translate_element" className="hidden" />

      <select
        disabled={!ready}
        onChange={handleLanguageChange}
        className="bg-[#04cac7]
        fixed 
        bottom-4
        right-4
        z-50
        w-fit
        h-fit
        cursor-pointer
        focus:outline-none
        focus:ring-2
        focus:ring-blue-300
        border border-gray-300 text-white px-4 py-2 rounded-xl rounded-xl"
      >
        <option value="">
          {ready ? "🌐 Select Language" : "Loading languages..."}
        </option>
        <option value="bn">বাংলা</option>
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="ms">Malay</option>
        <option value="el">Greek</option>
      </select>
    </>
  );
}
