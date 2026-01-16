"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Bell,
  Calendar,
  ChevronDownIcon,
  ChevronUpIcon,
  Clock9Icon,
  HeadsetIcon,
  Info,
  MapPinIcon,
  Megaphone,
  MenuIcon,
  Pin,
  PlusIcon,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GoSidebarExpand } from "react-icons/go";
import MobileMenu from "./mobile-menu";

import { useCart } from "@/hooks/useCart";
import { useNotices, type Notice } from "@/hooks/useNotices";
import { User as UserType } from "@/lib/auth";
import { format, isAfter } from "date-fns";
import { FaCartShopping } from "react-icons/fa6";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { UserDropdown } from "../user-dropdown";
import DesktopMenu from "./dekstop-menu";
import { MENU_ITEMS_DATA } from "./navmenus.constants";
import SearchbarSocials from "./searchbar-socials";
const HeaderInfo = ({
  className,
  onMenuClick,
}: {
  className?: string;
  onMenuClick?: () => void;
}) => (
  <div
    className={cn(
      "flex w-full flex-col gap-5 xl:flex-row xl:items-center xl:justify-end",
      className
    )}
  >
    <div className="flex lg:max-w-max w-full border-b xl:border-none pb-4 xl:pb-0 items-center gap-2">
      <Clock9Icon className="size-10 lg:size-14 text-primary" />
      <div>
        <p className="text-sm">Saturday and wednesday 10:00 - 05:00(PM) </p>
        <p className="text-[13px] text-neutral-500">
          Thursday and Friday - CLOSED
        </p>
      </div>
    </div>
    <div className="flex w-full lg:max-w-max   border-b xl:border-none pb-4 xl:pb-0 items-center gap-2">
      <HeadsetIcon className="size-10 lg:size-14 text-primary" />
      <div>
        <p className="text-sm">+880 1749-168119</p>
        <p className="text-[13px] text-neutral-500">
          dr.shaheen.mahmud@gmail.com
        </p>
      </div>
    </div>
    <div className="flex w-full lg:max-w-max  items-center border-b xl:border-none pb-4 xl:pb-0 gap-2">
      <MapPinIcon className="size-10 lg:size-14 text-primary" />
      <div>
        <p className="text-sm">Shaheen's Clinic, Block – A, House – 07</p>
        <p className="text-[13px] text-neutral-500">
          Mymensingh Road, Biswas Betka, Tangail.
        </p>
      </div>
    </div>
  </div>
);

// Header Notice Component
const HeaderNoticeButton = ({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: noticesData, isLoading } = useNotices({
    page: 1,
    limit: 5,
    publishedOnly: true,
  });

  const notices = noticesData?.notices || [];
  const pinnedNotices = notices.filter((n: Notice) => n.isPinned);
  const recentNotices = notices.filter((n: Notice) => !n.isPinned).slice(0, 3);
  const displayNotices = [...pinnedNotices, ...recentNotices].slice(0, 5);

  const isNoticeExpired = (notice: Notice) => {
    if (!notice.expiresAt) return false;
    return isAfter(new Date(), new Date(notice.expiresAt));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "important":
        return <AlertCircle className="h-4 w-4" />;
      case "update":
        return <Info className="h-4 w-4" />;
      case "maintenance":
        return <Wrench className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "important":
        return "bg-red-100 text-red-800 border-red-200";
      case "update":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "maintenance":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const iconColorClass =
    variant === "desktop"
      ? "text-white hover:text-white/80"
      : "text-primary hover:text-primary/80";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className={cn("relative transition-colors", iconColorClass)}>
          <Bell className="w-6 h-6" />
          {displayNotices.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
            >
              {displayNotices.length > 9 ? "9+" : displayNotices.length}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 max-h-[600px] overflow-y-auto p-0"
        align="end"
      >
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Notices
          </h3>
        </div>
        <div className="p-2">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notices...
            </div>
          ) : displayNotices.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notices available
            </div>
          ) : (
            <div className="space-y-2">
              {displayNotices.map((notice: Notice) => (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Card className="hover:bg-accent transition-colors cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {notice.title}
                        </CardTitle>
                        {notice.isPinned && (
                          <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {notice.summary && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notice.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className={`text-xs flex items-center gap-1 ${getCategoryColor(
                              notice.category
                            )}`}
                          >
                            {getCategoryIcon(notice.category)}
                            {notice.category.charAt(0).toUpperCase() +
                              notice.category.slice(1)}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(notice.createdAt), "MMM d")}
                          </div>
                          {isNoticeExpired(notice) && (
                            <Badge variant="outline" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
        {displayNotices.length > 0 && (
          <div className="p-4 border-t">
            <Link href="/notices">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                View All Notices
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const Header = ({
  user,
  onMenuClick,
  className,
  hideDashboardMenu = true,
}: {
  user?: UserType;
  onMenuClick?: () => void;
  className?: string;
  hideDashboardMenu?: boolean;
}) => {
  const [isOpenHeaderInfo, setIsOpenHeaderInfo] = useState(false);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);

  // Fetch cart data only if user is logged in
  const { data: cartData } = useCart(!!user);
  const cartItemsCount = cartData?.data?.items?.length || 0;

  return (
    <>
      <header className={className}>
        <div className="border-b">
          <div className="flex py-2 container mx-auto items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <button
                onClick={() => setIsOpenMobileMenu((prev) => !prev)}
                className="xl:hidden p-2"
              >
                <MenuIcon className="" />
              </button>
              <Link href={"/"}>
                <Image
                  src={"/log.png"}
                  alt="logo"
                  width={215}
                  height={55}
                  className="w-full h-24 rounded-lg"
                />
              </Link>
            </div>
            <HeaderInfo className="hidden xl:flex" />
            <div className="xl:hidden flex items-center gap-2">
              {hideDashboardMenu && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={onMenuClick}
                >
                  <GoSidebarExpand className="size-7" />
                </Button>
              )}
              <Popover
                open={isOpenHeaderInfo}
                onOpenChange={setIsOpenHeaderInfo}
              >
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-0 border border-primary">
                    <span
                      className={cn(
                        "size-9 grid place-items-center transition-all duration-300",
                        !isOpenHeaderInfo && "bg-primary text-white"
                      )}
                    >
                      <PlusIcon />
                    </span>
                    <span
                      className={cn(
                        "size-9 grid place-items-center transition-all duration-300",
                        isOpenHeaderInfo && "bg-primary text-white"
                      )}
                    >
                      {isOpenHeaderInfo ? (
                        <ChevronUpIcon />
                      ) : (
                        <ChevronDownIcon />
                      )}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="border-primary rounded-none"
                  align="end"
                >
                  <HeaderInfo className="flex-col items-start " />
                </PopoverContent>
              </Popover>

              <HeaderNoticeButton variant="mobile" />
              <UserDropdown user={user} />
            </div>
          </div>
        </div>
        <div className="border-b border-[#0CB8B6] bg-[#0CB8B6] text-white ">
          <div className="container hidden xl:flex items-center justify-between">
            <div>
              <ul className="flex items-center gap-0.5 ">
                {MENU_ITEMS_DATA.map((menu, index) => (
                  <DesktopMenu key={index} menu={menu} />
                ))}
              </ul>
            </div>
            <div className="inline-flex gap-4 items-center">
              <SearchbarSocials />

              <HeaderNoticeButton variant="desktop" />
              <UserDropdown user={user} />
              <Link href={"/cart"} className="relative">
                <FaCartShopping className="w-6 h-6" />
                {user && cartItemsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                  >
                    {cartItemsCount > 99 ? "99+" : cartItemsCount}
                  </Badge>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>
      <Sheet open={isOpenMobileMenu} onOpenChange={setIsOpenMobileMenu}>
        <SheetHeader className="p-0">
          <SheetTitle></SheetTitle>
        </SheetHeader>
        <SheetContent side="left">
          <div className="mt-6">
            <MobileMenu />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
