'use client'

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface Props {
  result: any; // The 'result' object from Face++
  originalImage: string;
  activeOverlays: string[];
}

const overlayStyles: { [key: string]: { color: string, type: 'rect' | 'circle' } } = {
    face_rectangle: { color: 'rgba(74, 144, 226, 0.7)', type: 'rect' },
    acne: { color: 'rgba(255, 0, 0, 0.7)', type: 'rect' },
    acne_pustule: { color: 'rgba(255, 100, 0, 0.7)', type: 'rect' },
    acne_nodule: { color: 'rgba(159, 33, 246, 0.7)', type: 'rect' },
    closed_comedones: { color: 'rgba(0, 255, 0, 0.7)', type: 'rect' },
    blackhead: { color: 'rgba(255, 0, 253, 0.7)', type: 'rect' },
    pores_mark: { color: 'rgba(0, 0, 255, 0.6)', type: 'circle' },
    enlarged_pore_count: { color: 'rgba(0, 0, 255, 0.6)', type: 'rect' }, // No direct coords, but can be linked to pores_mark
};

export default function SkinAnalysisVisualizer({ result, originalImage, activeOverlays }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const container = containerRef.current;
    if (!canvas || !ctx || !container) return;

    const img = new window.Image();
    img.src = originalImage;

    img.onload = () => {
        // Scale canvas to fit container while maintaining aspect ratio
        const containerWidth = container.offsetWidth;
        const scale = containerWidth / img.naturalWidth;
        const canvasWidth = containerWidth;
        const canvasHeight = img.naturalHeight * scale;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw overlays
        activeOverlays.forEach(key => {
            const style = overlayStyles[key];
            const data = result[key];
            if (!style || !data) return;

            ctx.strokeStyle = style.color;
            ctx.fillStyle = style.color;
            ctx.lineWidth = 2;

            const items = Array.isArray(data.rectangle) ? data.rectangle : (Array.isArray(data.coord) ? data.coord : []);

            if(key === 'face_rectangle') {
                ctx.strokeRect(data.left * scale, data.top * scale, data.width * scale, data.height * scale);
                return;
            }

            items.forEach((item: any) => {
                if (style.type === 'rect' && item.top) {
                    ctx.strokeRect(item.left * scale, item.top * scale, item.width * scale, item.height * scale);
                } else if (style.type === 'circle' && item.x) {
                    ctx.beginPath();
                    ctx.arc(item.x * scale, item.y * scale, (item.radius || 2) * scale, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
        });
    };

  }, [result, originalImage, activeOverlays]);

  return (
    <div ref={containerRef} className="relative w-full aspect-square">
      <Image src={originalImage} alt="Analyzed skin" layout="fill" objectFit="contain" className="rounded-lg" />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
}