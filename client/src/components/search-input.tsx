import { useState, useRef, type RefObject } from "react";
import { Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { useTaskSearchQuery } from "@/hooks/use-task-search-query";

export function SearchInput({ placeholder }: { placeholder: string }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { value, setValue } = useTaskSearchQuery();

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
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <>
      <div className="lg:hidden relative">
        <Button variant="outline" size="icon" onClick={handleOpen}>
          <Search className="size-4" />
        </Button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onPointerDown={handleClose} />

            <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-background border rounded-lg shadow-lg px-3 py-1">
              <SearchField
                id="search-mobile"
                placeholder={placeholder}
                value={value}
                onChange={setValue}
                onClear={handleClear}
                inputRef={inputRef}
                compact
                autoFocus
              />
            </div>
          </>
        )}
      </div>

      {/* Desktop */}
      <div className="relative hidden lg:block">
        <SearchField
          id="search-desktop"
          placeholder={placeholder}
          value={value}
          onChange={setValue}
          onClear={handleClear}
          inputRef={inputRef}
        />
      </div>
    </>
  );
}

type SearchFieldProps = {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  compact?: boolean;
  autoFocus?: boolean;
};

function SearchField({
  id,
  placeholder,
  value,
  onChange,
  onClear,
  inputRef,
  compact = false,
  autoFocus = false,
}: SearchFieldProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 z-10" />

      <Label htmlFor={id} className="sr-only">
        Search
      </Label>

      <Input
        ref={inputRef}
        id={id}
        placeholder={placeholder}
        className={compact ? "pl-8 pr-8 w-full py-1 text-sm" : "pl-8 pr-8"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
      />

      {value && (
        <button
          onPointerDown={onClear}
          className="absolute top-1/2 right-2 -translate-y-1/2 opacity-50 hover:opacity-100"
        >
          <X className={compact ? "size-4" : "size-4 cursor-pointer"} />
        </button>
      )}
    </div>
  );
}
