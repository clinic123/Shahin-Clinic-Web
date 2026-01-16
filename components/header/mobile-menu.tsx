import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { MENU_ITEMS_DATA, MenuItemType } from "./navmenus.constants";
import SearchbarSocials from "./searchbar-socials";

const MobileMenu: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);

  const handleToggle = (item: MenuItemType) => {
    // Only allow toggling for dropdown items. Non‑dropdown items should
    // simply navigate via their `href`. When integrating with a router
    // you could also handle navigation here.
    if (item.isDropdown) {
      setOpenItem((current) => (current === item.title ? null : item.title));
    }
  };

  return (
    <div className="w-full max-w-xs  overflow-y-auto">
      {/* Navigation list */}
      <div></div>
      <nav className="px-2 py-4">
    
        <SearchbarSocials />
        <ul className="space-y-1">
          {MENU_ITEMS_DATA.map((item) => {
            const isOpen = openItem === item.title;
            const isExpandable = item.isDropdown;
            return (
              <li key={item.title} className="group">
                {isExpandable ? (
                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    className={`flex w-full items-center justify-between py-2 px-4 rounded-md transition-colors duration-150 text-left
                      ${
                        isOpen
                          ? " text-primary"
                          : "text-gray-800 hover:bg-gray-100"
                      }
                      font-medium
                    `}
                  >
                    <span>{item.title}</span>
                    {/* Arrow icon indicates dropdown state */}
                    <svg
                      className={`h-4 w-4 ml-2 transition-transform duration-200 ease-in-out
                        ${
                          isOpen
                            ? "rotate-0 text-primary"
                            : "rotate-[275deg] text-gray-500 group-hover:text-gray-700"
                        }
                      `}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.293 4.293a1 1 0 011.414 0L12 8.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                ) : (
                  <a
                    href={item.href}
                    className="flex w-full items-center justify-between py-2 px-4 rounded-md transition-colors duration-150 text-gray-800 hover:bg-gray-100 font-normal"
                  >
                    {item.title}
                  </a>
                )}
                {/* Render sub items if present and open */}
                {isExpandable && isOpen && item.subItems && (
                  <ul className="mt-1 ml-6 space-y-1  pl-4">
                    {item.subItems.map((sub) => (
                      <li key={sub.label}>
                        <a
                          href={sub.href}
                          onClick={(e) => {
                            // Prevent default navigation if href is "#" and update
                            // selected submenu to highlight the clicked item. If
                            // integrating with a router, remove the preventDefault.
                            if (sub.href === "#") {
                              e.preventDefault();
                            }
                            setSelectedSubItem(sub.label);
                          }}
                          className={`block py-1 px-2 text-sm rounded-[4px] transition-colors duration-150
                            ${
                              selectedSubItem === sub.label
                                ? "text-primary border-l-2 border-primary font-medium"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }
                          `}
                        >
                          {sub.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default MobileMenu;
