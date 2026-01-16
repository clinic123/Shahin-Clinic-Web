"use client";

export default function LanguageSelector() {
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      window.open(value, "_blank");
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <select
        name="language"
        id="language"
        onChange={handleLanguageChange}
        className="bg-[#04cac7] border border-gray-300 text-white px-4 py-2 rounded-xl  focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
      >
        <option value="">🌐 Select Language</option>
        <option value="https://doctor--portal--web-vercel-app.translate.goog/?_x_tr_sl=en&_x_tr_tl=bn&_x_tr_hl=en-US&_x_tr_pto=wapp&_x_tr_hist=true">
          বাংলা
        </option>
        <option value="https://doctor--portal--web-vercel-app.translate.goog/?_x_tr_sl=en&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp&_x_tr_hist=true">
          English
        </option>
        <option value="https://doctor--portal--web-vercel-app.translate.goog/?_x_tr_sl=en&_x_tr_tl=hi&_x_tr_hl=en-US&_x_tr_pto=wapp&_x_tr_hist=true">
          हिंदी
        </option>
        <option value="https://doctor--portal--web-vercel-app.translate.goog/?_x_tr_sl=en&_x_tr_tl=ms&_x_tr_hl=en-US&_x_tr_pto=wapp&_x_tr_hist=true">
          Malay
        </option>
        <option value="https://doctor--portal--web-vercel-app.translate.goog/?_x_tr_sl=en&_x_tr_tl=el&_x_tr_hl=en-US&_x_tr_pto=wapp&_x_tr_hist=true">
          Greek
        </option>
      </select>
    </div>
  );
}

