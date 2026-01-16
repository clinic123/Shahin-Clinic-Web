import { LucideMapPin } from "lucide-react";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaRegEnvelope,
  FaYoutube,
} from "react-icons/fa";
import { IoMdTime } from "react-icons/io";

import { MdOutlinePhone } from "react-icons/md";

const icons = [
  {
    icon: <FaFacebookF />,
    link: "https://www.facebook.com/shaheensclinic",
    bg: "bg-[#06A6A7] ",
  },

  { icon: <FaInstagram />, link: "https://instagram.com", bg: "bg-[#06A6A7]" },
  {
    icon: <FaYoutube />,
    link: "https://www.youtube.com/@shaheensclinic",
    bg: "bg-[#06A6A7]",
  },
];

const Footer = async ({ hideMap = false }: { hideMap?: boolean }) => {
  return (
    <div>
      {!hideMap && (
        <div className="relative w-full h-[450px]">
          {!hideMap && (
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3637.610826335061!2d89.92141389999999!3d24.2553867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fdfb0d55f8477d%3A0xc8a05a7c01d313c8!2sHommyum%20Academy%20%26%20Pastry%20Shop!5e0!3m2!1sen!2sbd!4v1766592764056!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg w-full h-full"
              title="Google Map"
              style={{ border: 0 }}
            ></iframe>
          )}
          {/* Overlay Info Card */}
          <div className="hidden sm:flex absolute top-0 left-0 h-full w-full sm:w-80 bg-[#05b7b5] text-white p-6 flex-col justify-center gap-6 shadow-lg ml-20">
            {/* Address */}
            <div className="flex items-start gap-4">
              <LucideMapPin className="w-6 h-6 mt-1" />
              <div>
                <p className="font-semibold text-sm">ADDRESS</p>
                <p className="text-sm">
                  Shaheen's Clinic, Block – A, House – 07,
                  <br />
                  Mymensingh Road, Biswas Betka, Tangail.
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <FaRegEnvelope className="w-6 h-6 mt-1" />
              <div>
                <p className="font-semibold text-sm">EMAIL</p>
                <p className="text-sm">dr.shaheen.mahmud@gmail.com</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <MdOutlinePhone className="w-6 h-6 mt-1" />
              <div>
                <p className="font-semibold text-sm">PHONE</p>
                <p className="text-sm">+880 1749-168119</p>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="flex items-start gap-4">
              <IoMdTime className="w-6 h-6 mt-1" />
              <div>
                <p className="font-semibold text-sm">OPENING HOURS</p>
                <p className="text-sm">
                  Saturday and wednesday 10:00 - 05:00
                  <br />
                  Thursday and Friday closed
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer
        className=" py-12 sm:px-10 px-6 tracking-wide  "
        style={{
          background: "linear-gradient(rgb(255 255 255), rgb(8 203 194))",
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Newsletter Section */}
          {/* <div className="max-w-xl mx-auto text-center">
          <h2 className="text-bold -bold text-slate-200 text-">Newsletter</h2>
          <p className="text-[15px] mt-4 text-slate-600 leading-relaxed">
            Subscribe to our newsletter and stay up to date with the latest news,
            updates, and exclusive offers. Get valuable insights. Join our community today!
          </p>
          

          <div className="bg-white flex px-2 py-1.5  border border-[var(--primary)]/50 rounded-full text-left mt-8">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full outline-none bg-transparent text-sm pl-4"
            />
            <button
              type="button"
              className="bg-[var(--primary)] hover:bg-slate-800 text-white text-sm rounded-full px-4 py-2.5 ml-4 transition-all tracking-wide cursor-pointer"
            >
              Subscribe
            </button>
          </div>
        </div> */}

          {/* Footer Links Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
            {/* Column 1 */}
            <div>
              <Image
                width={250}
                alt="Logo"
                height={150}
                src={"/log.png"}
                className="w-36 h-40 rounded-lg"
              />
              <p className="text-black mb-2 text-[14px] leading-relaxed w-[280px] pt-3">
                Providing world-class classical homeopathic care for chronic
                diseases with a compassionate, patient-centered approach
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-lg font-semibold  mb-6 text-black text-">
                User Links
              </h4>
              <div className="w-8   h-0.5 bg-primary bottom-5 relative mt-3"></div>
              <ul className="space-y-4 capitalize">
                <li>
                  <a
                    href="/dashboard"
                    className="text-normal hover:text-black capitalize text- text-[16px] text-black "
                  >
                    Book Appointment
                  </a>
                </li>
                <li>
                  <a
                    href="/course"
                    className="text-normal hover:text-black capitalize text- text-[16px] text-black "
                  >
                    Our Courses
                  </a>
                </li>
                <li>
                  <a
                    href="/facilities"
                    className="text-normal hover:text-black capitalize text- text-[16px] text-black "
                  >
                    {" "}
                    Facilities{" "}
                  </a>
                </li>
                <li>
                  <a
                    href="/consulting"
                    className="text-normal hover:text-black capitalize text- text-[16px] text-black "
                  >
                    {" "}
                    Consulting{" "}
                  </a>
                </li>
                <li>
                  <a
                    href="/blogs"
                    className="text-normal hover:text-black capitalize text- text-[16px] text-black "
                  >
                    {" "}
                    Blog{" "}
                  </a>
                </li>
                <li>
                  <a
                    href="/login"
                    className="text-normal hover:text-black capitalize text- text-[16px] text-black "
                  >
                    Account
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-lg font-semibold  mb-6 text-black">
                Resources
              </h4>
              <div className="w-8   h-0.5 bg-primary bottom-5 relative mt-3"></div>
              <ul className="space-y-4 capitalize">
                <li>
                  <a
                    href="/success"
                    className="text-normal hover:text-black capitalize text- text-[16px] text-black "
                  >
                    Successful and cured cases
                  </a>
                </li>
                <li>
                  <a
                    href="/research"
                    className="text-normal hover:text-black capitalize text- text-[16px] text-black "
                  >
                    Scientific Papers and Research Articles
                  </a>
                </li>
                <li>
                  <a
                    href="/workshops"
                    className="text-normal hover:text-black capitalize text- text-[16px] text-black "
                  >
                    Webinars & Workshops
                  </a>
                </li>
                <li>
                  <a
                    href="/forum"
                    className="text-normal hover:text-black capitalize text- text-[16px] text-black "
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="text-lg font-semibold  mb-6 text-black">
                Follow Us
              </h4>
              <div className="w-8   h-0.5 bg-primary bottom-5 relative "></div>
              <ul className="space-y-4 capitalize">
                <div className="flex gap-4  mt-6">
                  {icons.map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition-transform transform hover:scale-125 ${item.bg} hover:shadow-lg`}
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      <div className="text-center bg-[#2E3037] text-gray-200 text-[15px] py-1 md:flex justify-center gap-2">
        <p>
          © {new Date().getFullYear()} Shaheen's Clinic | All rights reserved.
        </p>
        {/* <a href="https://md-emon.vercel.app/" className="text-blue-500">Develop By Emon</a> */}
      </div>
    </div>
  );
};

export default Footer;
