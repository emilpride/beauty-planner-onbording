'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import Battery from '../../Battery/Battery.js'

import { useState, useRef, useCallback, useEffect } from 'react'

export default function EnergyLevelStep() {
  // const { setAnswer } = useQuizStore() // Раскомментируйте для интеграции со стором
  const [level, setLevel] = useState(3)
  const [fillPercent, setFillPercent] = useState(60)
  const [isDragging, setIsDragging] = useState(false)
  const batteryRef = useRef<HTMLDivElement>(null)

  // Цвет от красного к зеленому
  const getColor = (percent: number) => {
    const hue = (percent / 100) * 120;
    return `hsl(${hue}, 80%, 50%)`;
  };

  const handleInteractionMove = useCallback((clientX: number) => {
  if (!batteryRef.current) return;
  const rect = batteryRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const newPercent = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setFillPercent(newPercent);
    const newLevel = newPercent > 99 ? 5 : Math.floor(newPercent / 20) + 1;
    setLevel(newLevel);
  }, []);

  const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    let clientX: number;
    if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
      clientX = e.touches[0].clientX;
    } else if (e instanceof MouseEvent) {
      clientX = e.clientX;
    } else {
      return;
    }
    handleInteractionMove(clientX);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        let clientX: number;
        if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
          clientX = e.touches[0].clientX;
        } else if (e instanceof MouseEvent) {
          clientX = e.clientX;
        } else {
          return;
        }
        handleInteractionMove(clientX);
      }
    };
    const handleInteractionEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        // setAnswer('EnergyLevel', level); // Для интеграции со стором
        console.log(`Final level selected: ${level}`);
      }
    };
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('mouseup', handleInteractionEnd);
      document.addEventListener('touchend', handleInteractionEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleInteractionEnd);
      document.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [isDragging, handleInteractionMove]);

  return (
    <OnboardingStep
      title="How's Your Daily Energy Level?"
      condition={true}
      onNext={() => {}}
    >
      <div
        className="flex flex-col items-center justify-center w-full h-full py-8 select-none"
        onMouseDown={handleInteractionStart}
        onTouchStart={handleInteractionStart}
        ref={batteryRef}
      >
        <Battery
          chargePercent={fillPercent}
          color={getColor(fillPercent)}
          isDragging={isDragging}
        />
      </div>
    </OnboardingStep>
  )
}
