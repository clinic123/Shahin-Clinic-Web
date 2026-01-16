"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SubItem {
  label: string;
  href: string;
}

interface MenuItemType {
  title: string;
  href: string;
  isDropdown: boolean;
  subItems?: SubItem[];
}

interface DesktopMenuProps {
  menu: MenuItemType;
}

const subMenuAnimate = {
  enter: {
    opacity: 1,
    rotateX: 0,
    display: "block",
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    rotateX: -15,
    transition: { duration: 0.2 },
    transitionEnd: { display: "none" },
  },
};

const DesktopMenu: React.FC<DesktopMenuProps> = ({ menu }) => {
  const [isHover, setIsHover] = useState(false);
  const toggleHoverMenu = () => setIsHover(true);
  const closeHoverMenu = () => setIsHover(false);

  const hasSubMenu = Array.isArray(menu?.subItems) && menu.subItems.length > 0;

  return (
    <motion.li
      className="relative group/link"
      onHoverStart={toggleHoverMenu}
      onHoverEnd={closeHoverMenu}
    >
      <Link
        href={menu.href || "#"}
        onClick={closeHoverMenu}
        className="flex items-center gap-1 px-4 text-[#ffff] hover:text-gray-200 py-2 font-semibold rounded-md transition-all duration-200 text-sm"
      >
        {menu.title}
        {hasSubMenu && (
          <ChevronDown
            className={`mt-[1px] transition-transform ${
              isHover ? "rotate-180" : ""
            }`}
            size={18}
          />
        )}
      </Link>

      {hasSubMenu && (
        <motion.div
          className="absolute top-full left-0 z-50 bg-[#0CB8B6] shadow-xl hover:text-gray-200 rounded-lg mt-3 px-4 py-3 grid gap-4 min-w-[200px] border border-[#0CB8B6] 
            before:content-[''] before:absolute before:top-[-12px] before:left-[22px] 
            before:w-0 before:h-0 before:border-l-[12px] before:border-r-[12px] 
            before:border-b-[12px] before:border-l-transparent before:border-r-transparent 
            before:border-b-white before:z-50"
          initial="exit"
          animate={isHover ? "enter" : "exit"}
          variants={subMenuAnimate}
        >
          {menu.subItems?.map((sub, index) => (
            <NestedSubMenu item={sub} key={index} closeAll={closeHoverMenu} />
          ))}
        </motion.div>
      )}
    </motion.li>
  );
};

interface NestedSubMenuProps {
  item: SubItem;
  closeAll: () => void;
}

const NestedSubMenu: React.FC<NestedSubMenuProps> = ({ item, closeAll }) => (
  <Link
    href={item.href || "#"}
    onClick={closeAll}
    className="flex items-center justify-between hover:text-gray-200 px-2 py-1 rounded-md transition-all duration-200 whitespace-nowrap text-sm font-semibold"
  >
    {item.label}
  </Link>
);

export default DesktopMenu;
