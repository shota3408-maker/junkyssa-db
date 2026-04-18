// src/components/CoffeeCupIcon.tsx
import React from 'react';

export function CoffeeCupIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 湯気 */}
      <path d="M13 8 Q14 5 13 3" stroke="#C8860A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M19 7 Q20 4 19 2" stroke="#C8860A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M25 8 Q26 5 25 3" stroke="#C8860A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      {/* カップ本体 */}
      <path d="M8 13 L10 30 Q10 32 12 32 L26 32 Q28 32 28 30 L30 13 Z" fill="#FDF6E3" stroke="#C8860A" strokeWidth="1.5"/>
      {/* コーヒー液面 */}
      <ellipse cx="19" cy="15" rx="9.5" ry="2.5" fill="#6B3A2A" opacity="0.9"/>
      {/* ハンドル */}
      <path d="M30 17 Q36 17 36 22 Q36 27 30 27" stroke="#C8860A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* ソーサー */}
      <ellipse cx="19" cy="33.5" rx="13" ry="2" fill="#C8860A" opacity="0.4"/>
    </svg>
  );
}
