// Файл: beauty-quiz/components/animations/CircularProgressAnimation.tsx

"use client";

import React, { useState, useEffect } from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  gradientFrom?: string; // Начальный цвет градиента
  gradientTo?: string;   // Конечный цвет градиента
}

const CircularProgressAnimation: React.FC<CircularProgressProps> = ({
  percentage,
  size = 175, // 1. УМЕНЬШИЛИ РАЗМЕР по умолчанию (250 * 0.7 = 175)
  strokeWidth = 12,
  gradientFrom = "#3b82f6", // Синий (blue-500)
  gradientTo = "#ec4899",   // Розовый (pink-500)
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const viewBox = `0 0 ${size} ${size}`;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const gradientId = "progressGradient";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox={viewBox}>
        {/* 2. ДОБАВИЛИ ОПРЕДЕЛЕНИЕ ГРАДИЕНТА */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>

        {/* Фоновый круг */}
        <circle
          className="text-gray-200"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Круг прогресса */}
        <circle
          className="transition-all duration-1000 ease-out"
          stroke={`url(#${gradientId})`} // 3. ПРИМЕНИЛИ ГРАДИЕНТ
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <span className="absolute text-3xl font-bold text-gray-700">
        {`${Math.round(progress)}%`}
      </span>
    </div>
  );
};

export default CircularProgressAnimation;
