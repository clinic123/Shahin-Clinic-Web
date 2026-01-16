import { ExternalLink, MessageCircle, Phone } from "lucide-react";

const InformationCard = () => {
  const contactInfo = [
    {
      label: "নাম্বার:",
      value: "01749168119",
      type: "phone",
    },
    {
      label: "সময়:",
      value: "সকাল ১১টা থেকে বিকেল ৫টা এবং সন্ধ্যা ৭ টা থেকে রাত্রি ১০টা",
      subtext: "(11:00 AM - 5:00 PM and 7:00 PM - 10:00 PM)",
    },
  ];

  const treatmentProcess = [
    "অনলাইনে চিকিৎসা গ্রহণ করতে চাইলে রোগীকে 01749168119 নাম্বারে কল করে এপয়েন্টমেন্ট নিতে হবে এবং জানাতে হবে যে তিনি অনলাইনে চিকিৎসা গ্রহণ করতে চান।",
    "এপয়েন্টমেন্ট চূড়ান্ত করার জন্য রোগী প্রথমে কনসালটেশন ফি বিকাশ বা নগদ থেকে 01734077111 নাম্বারে প্রদান করতে হবে।",
    "ট্রানসাকশন আইডি অথবা টাকা পাঠানোর স্ক্রিনশট হোয়াটস-আপে প্রদান করতে হবে।",
    "প্যাথলজিক্যাল কাগজপত্রের যতটা সম্ভব সুস্পষ্ট স্ক্যানড কপি হোয়াটসআপটিতে পাঠাতে হবে।",
    "রোগীর বা রোগীর রোগাক্রান্ত অংশের বা যে কোনো ছবি পাঠানোর প্রয়োজন হলে সেই ছবিগুলো পাঠাতে হবে।",
    "রোগীকে কুরিয়ারের মাধ্যমে ঔষধ পাঠানোর পূর্ণাঙ্গ ঠিকানা হোয়াটস-আপটিতে দিতে হবে।",
  ];

  const drShahinFees = [
    {
      type: "সরাসরি ক্লিনিকে এসে চিকিৎসা গ্রহণের:",
      fees: [
        { label: "প্রথমবারের কনসালটেশন ফি:", amount: "১,৬০০ টাকা" },
        { label: "পরবর্তী সমস্ত ফলো-আপ:", amount: "১,৩০০ টাকা" },
      ],
    },
    {
      type: "অনলাইনে চিকিৎসা গ্রহণের:",
      fees: [
        { label: "প্রথমবারের কনসালটেশন ফি:", amount: "১,৮০০ টাকা" },
        { label: "পরবর্তী সমস্ত ফলো-আপ:", amount: "১,৬০০ টাকা" },
      ],
    },
  ];

  const otherDoctorsFees = [
    {
      type: "সরাসরি ক্লিনিকে এসে চিকিৎসা গ্রহণের:",
      fees: [
        { label: "প্রথমবারের কনসালটেশন ফি:", amount: "৮০০ টাকা" },
        { label: "পরবর্তী সমস্ত ফলো-আপ:", amount: "৬০০ টাকা" },
      ],
    },
    {
      type: "অনলাইনে চিকিৎসা গ্রহণের:",
      fees: [
        { label: "প্রথমবারের কনসালটেশন ফি:", amount: "১,০০০ টাকা" },
        { label: "পরবর্তী সমস্ত ফলো-আপ:", amount: "৮০০ টাকা" },
      ],
    },
  ];

  const benefits = [
    "এই ফি প্রদানের পরে রোগীদের আর ঔষধ কিংবা কুরিয়ারের জন্য আলাদা কোনো টাকা প্রদান করতে হবে না।",
    "প্রবাসী রোগীদের বিভিন্ন প্রতিকূল পরিস্থিতির সাপেক্ষে অতিরিক্ত কেয়ার প্রয়োজন পড়ে- সেখানে তাদেরকে আলাদাভাবে ও পৃথক নিয়মে সেবা প্রদান করা হবে।",
    "কেউ তার পরীক্ষা নিরীক্ষার কাগজ পাঠিয়ে তার চিকিৎসার ব্যাপারে অনুসন্ধান করতে চাইলে 01749168119 নাম্বারে ফোন করে পাওয়া গাইড লাইন অনুসরণ করে সেই সেবা পেতে পারেন।",
  ];

  return (
    <div className="w-full lg:col-span-4 bg-[#EDEDED] text-black p-6 rounded-[10px] shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-green-700 text-center">
        অনলাইনে চিকিৎসা গ্রহণের পদ্ধতি ও কনসালটেশন ফি
      </h2>
      <p className="text-gray-700 mb-6 text-center">
        Complete guide for online treatment and consultation fees
      </p>

      {/* Contact Information */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-4 text-blue-800 flex items-center gap-2">
          <Phone className="h-5 w-5" />
          এপয়েন্টমেন্ট, তথ্যানুসন্ধান ও যোগাযোগের নাম্বার ও একটিভ সময়:
        </h3>
        <div className="bg-white p-4 rounded-lg">
          <ul>
            {contactInfo.map((info, index) => (
              <li
                key={index}
                className="py-3 border-b border-gray-300 last:border-none flex flex-col gap-1"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium">{info.label}</span>
                  {info.type === "phone" ? (
                    <a
                      href={`tel:${info.value}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-right"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <span className="text-green-600 font-semibold text-right max-w-[60%]">
                      {info.value}
                    </span>
                  )}
                </div>
                {info.subtext && (
                  <span className="text-sm text-gray-600 text-right">
                    {info.subtext}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Online Treatment Process */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-4 text-green-700">
          অনলাইনে চিকিৎসা গ্রহণের পদ্ধতি:
        </h3>
        <div className="bg-white p-4 rounded-lg">
          <ul className="space-y-3">
            {treatmentProcess.map((step, index) => (
              <li
                key={index}
                className="py-2 border-b border-gray-300 last:border-none text-sm text-gray-700"
              >
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Dr. Shahin Mahmud Fees */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-4 text-green-700">
          ডা. শাহীন মাহমুদ স্যারের নিকট চিকিৎসা গ্রহণের ফি:
        </h3>
        <div className="space-y-4">
          {drShahinFees.map((feeType, index) => (
            <div key={index} className="bg-white p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-800">{feeType.type}</h4>
              <ul>
                {feeType.fees.map((fee, feeIndex) => (
                  <li
                    key={feeIndex}
                    className="py-2 border-b border-gray-300 last:border-none flex justify-between items-center text-sm"
                  >
                    <span className="font-medium">{fee.label}</span>
                    <span className="text-teal-600 font-semibold">
                      {fee.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Other Doctors Fees */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-4 text-green-700">
          অন্যান্য ডাক্তাদের নিকট চিকিৎসা গ্রহণের ফি:
        </h3>
        <div className="space-y-4">
          {otherDoctorsFees.map((feeType, index) => (
            <div key={index} className="bg-white p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-800">{feeType.type}</h4>
              <ul>
                {feeType.fees.map((fee, feeIndex) => (
                  <li
                    key={feeIndex}
                    className="py-2 border-b border-gray-300 last:border-none flex justify-between items-center text-sm"
                  >
                    <span className="font-medium">{fee.label}</span>
                    <span className="text-teal-600 font-semibold">
                      {fee.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div>
        <h3 className="font-semibold text-lg mb-4 text-green-700">
          সুবিধাসমূহ:
        </h3>
        <div className="bg-white p-4 rounded-lg">
          <ul className="space-y-3">
            {benefits.map((benefit, index) => (
              <li
                key={index}
                className="py-2 border-b border-gray-300 last:border-none text-sm text-gray-700"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Google Form Link */}
      <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h4 className="font-medium mb-2 text-amber-700 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          গুগল ফর্ম মাধ্যমে কেইস-রেকর্ড:
        </h4>
        <p className="text-sm text-gray-600 mb-2">
          রোগীগণ নিচের লিংকে গিয়ে, সেখানে থাকা গুগল ফর্ম পূরণের মাধ্যমে নিজেরাও
          তাদের কেইস-রেকর্ড করে পাঠাতে পারেন:
        </p>
        <a
          href="https://docs.google.com/forms/d/1cmkuis1UfRyNVSQQGBM87ncq9sUYFpFxIh02aKZ3Iv0/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <ExternalLink className="h-3 w-3" />
          গুগল ফর্ম লিংক
        </a>
      </div>
    </div>
  );
};

export default InformationCard;
