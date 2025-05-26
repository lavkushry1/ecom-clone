'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}

interface DropdownItemProps {
  value: string;
  children: React.ReactNode;
}

export function Dropdown({ value, onValueChange, placeholder, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div 
            className="py-1"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const value = target.getAttribute('data-value');
              if (value) {
                onValueChange(value);
                setIsOpen(false);
              }
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ value, children }: DropdownItemProps) {
  return (
    <div
      data-value={value}
      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </div>
  );
}
