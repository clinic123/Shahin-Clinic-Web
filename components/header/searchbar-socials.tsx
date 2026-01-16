import { SearchIcon } from "lucide-react";
import { FaFacebookF,  FaYoutube } from "react-icons/fa";

const SearchbarSocials = () => {
  return (
    <div className="inline-flex flex-col lg:flex-row lg:items-center gap-4 pb-4 lg:pb-0 lg:gap-6">
      <div className="flex items-center gap-2">
        <div className="border-x bg-border lg:bg-transparent py-4 px-2 inline-flex items-center gap-1">
          <input
            type="text"
            placeholder="Looking for"
            className="border-none   max-w-[100px] flex-1 outline-0 focus:outline-none focus:border-none text-xs"
          />
          <SearchIcon size={16} />
        </div>
      </div>
      <div className="inline-flex items-center gap-4">
        <a href="https://www.facebook.com/shaheensclinic" target="_blank" rel="noopener noreferrer">
          <FaFacebookF className="text-white" />
        </a>
        <a href="https://www.youtube.com/@shaheensclinic" target="_blank" rel="noopener noreferrer">
          <FaYoutube className="text-white" />
        </a>
        
      </div>
    </div>
  );
};

export default SearchbarSocials;
