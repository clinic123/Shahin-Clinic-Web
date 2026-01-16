interface SubItem {
  label: string;
  href: string;
}

export interface MenuItemType {
  title: string;
  href: string;
  isDropdown: boolean;
  subItems?: SubItem[];
}

export const MENU_ITEMS_DATA: MenuItemType[] = [
  {
    title: "Home",
    href: "/",
    isDropdown: false,
  },
  {
    title: "About",
    href: "/about",
    isDropdown: true,
    subItems: [
      { label: "Dr. Shaheen Mahmud", href: "/dr-shaheen" },
      { label: "Shaheen's Clinic International", href: "/international" },
      { label: "shaheen's clinic", href: "/clinic" },
      { label: "Scope", href: "/scope" },
      { label: "Notice", href: "/notices" },
    ],
  },
  {
    title: "Pages",
    href: "#",
    isDropdown: true,
    subItems: [
      { label: "Doctors", href: "/teams" },
      { label: "Facilities", href: "/facilities" },
      { label: "Consulting", href: "/consulting" },
      { label: "Appointment", href: "/dashboard" },
      { label: "Successful and Cured Cases", href: "/success" },
      { label: "Webinars & Workshops", href: "/workshops" },
      { label: "Scientific Papers", href: "/research" },
    ],
  },
  {
    title: "Blog",
    href: "/blogs",
    isDropdown: false,
  },
  {
    title: "Publication",
    href: "/books",
    isDropdown: false,
  },
  {
    title: "Courses",
    href: "/courses",
    isDropdown: false,
  },
  {
    title: "Forum",
    href: "/forum",
    isDropdown: false,
  },
  {
    title: "Scop",
    href: "/scope",
    isDropdown: false,
  },
  {
    title: "SCI",
    href: "/international",
    isDropdown: false,
  },
  {
    title: "Contact",
    href: "/contact",
    isDropdown: false,
  },
];
