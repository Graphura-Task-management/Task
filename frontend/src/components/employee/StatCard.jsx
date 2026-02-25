import React from "react";

export default function StatCard({ title, value, icon, color, bgColor, borderSide }) {
  return (
    <div className={`bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border-l-4 ${borderSide} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group`}>
      <div className="flex flex-col">
        {/* Icon Container */}
        <div className={`w-14 h-14 ${bgColor} ${color} rounded-[1.2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
          {icon && React.cloneElement(icon, { size: 28 })}
        </div>

        {/* Text Content */}
        <div>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] mb-1">
            {title}
          </p>
          <p className={`text-4xl font-black tracking-tight ${color}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}