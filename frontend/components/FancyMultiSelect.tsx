// BASED ON: https://github.com/mxkaske/mxkaske.dev/blob/main/components/craft/fancy-multi-select.tsx
import * as React from "react";
import { X } from "lucide-react";
import {Command, CommandGroup, CommandItem, CommandList} from "cmdk";
import { Command as CommandPrimitive } from "cmdk";
import {Badge} from "@/components/ui/badge";
import {useEffect} from "react";

type Option = {
    value: string,
    label: string,
}

interface FancyMultiSelectProps extends React.HTMLAttributes<HTMLElement> {
    options: Option[];
    onSelectionChange: (selected: Option[]) => void;
    placeholder?: string;
    selected: Option[];
    sortSelected?: boolean;
}
export function FancyMultiSelect({ options, placeholder, selected, sortSelected, onSelectionChange }: FancyMultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = React.useCallback((option: Option) => {
        onSelectionChange(selected.filter((s) => s.value !== option.value));
    }, [onSelectionChange, selected]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            const input = inputRef.current;
            if (input) {
                if (e.key === "Delete" || e.key === "Backspace") {
                    if (input.value === "") {
                        const newSelected = [...selected];
                        newSelected.pop();

                        onSelectionChange(newSelected)
                    }
                }
                // This is not a default behaviour of the <input /> field
                if (e.key === "Escape") {
                    input.blur();
                }
            }
        },
        []
    );

    const selectables = options.filter(
        (option) => !selected.some((s) => s.value === option.value)
    );

    return (
        <Command
            onKeyDown={handleKeyDown}
            className="overflow-visible bg-transparent"
        >
            <div className="group rounded-md bg-background border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-2">
                    {selected.map((option) => {
                        return (
                            <Badge key={option.value} variant="outline">
                                {option.label}
                                <button
                                    className="ml-1 rounded-lg outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUnselect(option);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={() => handleUnselect(option)}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        );
                    })}
                    {/* Avoid having the "Search" Icon */}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder={placeholder || ""}
                        className="ml-1 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>
            <div className="relative self-start">
                <CommandList>
                    {open && selectables.length > 0 ? (
                        <div className="absolute top-0 z-10 mt-2 py-1.5 px-2 text-sm focus:bg-accent focus:text-accent-foreground w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                            <CommandGroup className="h-44 overflow-auto">
                                {selectables.map((option) => {
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onSelect={(value) => {
                                                setInputValue("");

                                                if (sortSelected) {
                                                  const newSelected = [...selected, option].sort((a, b) => a.value.localeCompare(b.value));
                                                  onSelectionChange(newSelected)
                                                } else {
                                                  const newSelected = [...selected, option];
                                                  onSelectionChange(newSelected)
                                                }
                                            }}
                                            className={"cursor-pointer h-8 rounded-sm flex items-center px-2 pl-8 hover:bg-accent hover:text-accent-foreground"}
                                        >
                                            {option.label}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </div>
                    ) : null}
                </CommandList>
            </div>
        </Command>
    );
}