"use client";

import React from "react";
import { Search } from "lucide-react";

interface GroupSearchProps {
    value: string;
    onChange: (v: string) => void;
}

export function GroupSearch({ value, onChange }: GroupSearchProps) {
    return (
        <div className="relative w-full max-w-xl group mb-8">
            <Search 
                size={18} 
                className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-300" 
            />
            <input
                placeholder="Tìm kiếm nhanh tên hoặc ID nhóm..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-[4.8rem] bg-surface-2 border border-border rounded-[2rem] pl-16 pr-6 text-[1.4rem] font-bold focus:border-primary focus:bg-surface-3 transition-all duration-300 outline-none shadow-sm"
            />
        </div>
    );
}
