import { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearch } from "@tanstack/react-router";

export function SearchInput({ placeholder }: { placeholder: string }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();
  const searchQuery = useSearch({ strict: false });
  const value = (searchQuery.search as string) ?? "";

  const handleChange = (val: string) => {
    navigate({
      // @ts-expect-error — search params di-handle via validateSearch di route
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        search: val || undefined,
      }),
      replace: true,
    });
  };

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClear = () => {
    handleChange("");
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Mobile & Tablet */}
      <div className="lg:hidden relative">
        <Button
          ref={triggerRef}
          variant="outline"
          size="icon"
          onClick={handleOpen}
        >
          <Search className="size-4" />
        </Button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onPointerDown={handleClose} />

            <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-background border rounded-lg shadow-lg px-3 py-1">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50" />

                <Label htmlFor="search-mobile" className="sr-only">
                  Search
                </Label>

                <Input
                  ref={inputRef}
                  id="search-mobile"
                  placeholder={placeholder}
                  className="pl-8 pr-8 w-full py-1 text-sm"
                  value={value}
                  onChange={(e) => handleChange(e.target.value)}
                  autoFocus
                />

                {value && (
                  <button
                    onPointerDown={handleClear}
                    className="absolute top-1/2 right-2 -translate-y-1/2 opacity-50 hover:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop */}
      <div className="relative hidden lg:block">
        <Label htmlFor="search-desktop" className="sr-only">
          Search
        </Label>

        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 z-10" />

        <Input
          ref={inputRef}
          id="search-desktop"
          placeholder={placeholder}
          className="pl-8 pr-8"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />

        {value && (
          <button
            onPointerDown={handleClear}
            className="absolute top-1/2 right-2 -translate-y-1/2 opacity-50 hover:opacity-100"
          >
            <X className="size-4 cursor-pointer" />
          </button>
        )}
      </div>
    </>
  );
}
