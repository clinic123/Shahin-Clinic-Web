import { IoCheckmarkDone } from "react-icons/io5";
import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      richColors
      expand
      toastOptions={{
        classNames: {
          toast:
            "border rounded-2xl shadow-lg px-4 py-3 !items-start flex gap-2 text-xs",
          title: "text-black text-base font-semibold",
          description: "text-[#595959]",
          icon: "size-5 mt-1 shrink-0",
          closeButton: "text-gray-500 hover:text-black text-xs ",
        },
      }}
      icons={{
        success: <IoCheckmarkDone />,
        error: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" fill="#FEE2E2" />
            <path
              d="M15 9L9 15M9 9L15 15"
              stroke="#DC2626"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
        warning: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" fill="#FEF9C3" />
            <path
              d="M12 8v4m0 4h.01"
              stroke="#CA8A04"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        info: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" fill="#DBEAFE" />
            <path
              d="M12 8h.01M12 12v4"
              stroke="#2563EB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      }}
      theme="light"
    />
  );
}
