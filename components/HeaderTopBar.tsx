"use client";

import Link from "next/link";
import {

  FaFacebookF,
  FaTwitter,
  FaPinterestP,
  FaPhone,
 
} from "react-icons/fa";
import { FiClock, FiMail } from "react-icons/fi";


export default function Navbar() {


  // ✅ Topbar Items
  const topItems = [
    {
      icon: <FiClock className=" text-2xl" />,
      text: " 11:00 AM to 5:00 PM and 7:00 PM to 10:00 PM",
    },
    {
      icon: <FaPhone className="  text-2xl" />,
      text: "+8801734077111",
      link: "tel:+8801734077111",
    },
    {
      icon: <FiMail className=" text-2xl" />,
      text: "dr.shaheen.mahmud@gmail.com",
      link: "mailto:dr.shaheen.mahmud@gmail.com",
    },
  ];

 

  return (
    <header className="w-full ">
      {/* ✅ Top Bar (Desktop Only) */}
      <div className="hidden lg:flex justify-between  items-center bg-[var(--primary)] py-2 px-6 text-sm text-[var(--white)]">
        <div className="flex items-center gap-6">
          {topItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-base">
              {item.icon}
              {item.link ? (
                <a href={item.link}>{item.text}</a>
              ) : (
                <span>{item.text}</span>
              )}
            </div>
          ))}
        </div>
         <Link href={'/appointment'}>
         <button className="px-4 py-2 text-sm rounded-full font-medium cursor-pointer tracking-wide text-white hover:bg-[var(--secondary)]  bg-[#FFFFFF]/30 transition-all md:hidden sm:hidden lg:block">
  Appointment
</button>

          </Link>
      </div>

     
    </header>
  );
}
