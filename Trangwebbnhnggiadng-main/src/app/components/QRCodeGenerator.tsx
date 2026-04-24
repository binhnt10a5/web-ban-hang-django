import React, { useEffect, useRef } from 'react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

export function QRCodeGenerator({ value, size = 200 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR code representation using text
    // In production, you would use a proper QR code library
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#000000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw a simple grid pattern to represent QR code
    const gridSize = 10;
    const cellSize = size / gridSize;

    // Create a deterministic pattern based on the value
    const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const shouldFill = ((i + j + hash) % 3) !== 0;
        if (shouldFill) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add text in center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(size / 4, size / 4, size / 2, size / 2);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px sans-serif';
    
    const lines = ['QR CODE', 'SCAN ME'];
    lines.forEach((line, index) => {
      ctx.fillText(line, size / 2, size / 2 - 10 + (index * 20));
    });

  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded"
    />
  );
}
