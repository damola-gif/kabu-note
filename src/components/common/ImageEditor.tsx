
import React, { useRef, useEffect, useState } from "react";
import { Pen, Eraser, Image as ImageIcon } from "lucide-react";

type Tool = "pen" | "highlighter" | "eraser";

interface ImageEditorProps {
  imageUrl?: string;
  onEdit?: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageUrl,
  onEdit,
  width = 420,
  height = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState<string>("#ff8000");
  const [highlightColor, setHighlightColor] = useState<string>("#ffe066");

  // Draw image when loaded
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const img = new window.Image();
    img.onload = () => {
      ctx?.clearRect(0, 0, width, height);
      ctx?.drawImage(img, 0, 0, width, height);
    };
    img.src = imageUrl;
  }, [imageUrl, width, height]);

  // Handle drawing
  const handlePointerDown = (e: React.PointerEvent) => {
    setDrawing(true);
    draw(e, true);
  };
  const handlePointerUp = () => {
    setDrawing(false);
    if (onEdit && canvasRef.current) {
      onEdit(canvasRef.current.toDataURL());
    }
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawing) return;
    draw(e, false);
  };

  // Drawing logic
  function draw(e: React.PointerEvent, justBegin: boolean) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;

    if (justBegin) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 16;
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else if (tool === "highlighter") {
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = 14;
        ctx.strokeStyle = highlightColor;
        ctx.globalAlpha = 0.3;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 1.0;
      }
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  }

  // Tool UI
  return (
    <div>
      <div className="flex gap-3 mb-2">
        <button
          type="button"
          className={`p-2 rounded ${tool === "pen" ? "bg-orange-200" : "bg-white"} border`}
          onClick={() => setTool("pen")}
          aria-label="Pen"
        >
          <Pen className="h-5 w-5 text-orange-500" />
        </button>
        <button
          type="button"
          className={`p-2 rounded ${tool === "highlighter" ? "bg-orange-100" : "bg-white"} border`}
          onClick={() => setTool("highlighter")}
          aria-label="Highlighter"
        >
          <Pen className="h-5 w-5 text-orange-300" />
        </button>
        <button
          type="button"
          className={`p-2 rounded ${tool === "eraser" ? "bg-zinc-200" : "bg-white"} border`}
          onClick={() => setTool("eraser")}
          aria-label="Eraser"
        >
          <Eraser className="h-5 w-5 text-zinc-500" />
        </button>
        {/* Color picker only for pen */}
        {tool === "pen" && (
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="ml-2"
            aria-label="Pen color"
          />
        )}
      </div>
      <div className="border border-orange-100 dark:border-zinc-700 rounded-md overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ cursor: tool === "pen" ? "crosshair" : "pointer", touchAction: "none" }}
          className="w-full max-w-full bg-zinc-900"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerMove={handlePointerMove}
        />
        {!imageUrl && (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center pointer-events-none">
            <ImageIcon className="h-12 w-12 text-orange-100 opacity-60" />
            <span className="text-zinc-400 text-xs">Upload an image to annotate</span>
          </div>
        )}
      </div>
    </div>
  );
};
