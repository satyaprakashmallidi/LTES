import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eraser, Check } from "lucide-react";

interface SignaturePadProps {
  onSignatureChange: (signature: string | null, timestamp: string | null) => void;
  signature: string | null;
  signatureTimestamp?: string | null;
}

export function SignaturePad({ onSignatureChange, signature, signatureTimestamp }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas with proper scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = 200 * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = "200px";
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, rect.width, 200);
      }
      
      // Redraw existing signature if present
      if (signature) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, rect.width, 200);
            ctx.drawImage(img, 0, 0, rect.width, 200);
          }
          setHasSignature(true);
        };
        img.src = signature;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (signature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          setHasSignature(true);
        };
        img.src = signature;
      }
    }
  }, [signature]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    if (!hasSignature) {
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas && hasSignature) {
        const dpr = window.devicePixelRatio || 1;
        
        // Create a temporary canvas at 1:1 scale for export
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = canvas.width / dpr;
        exportCanvas.height = canvas.height / dpr;
        const exportCtx = exportCanvas.getContext("2d");
        if (exportCtx) {
          exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
          const dataUrl = exportCanvas.toDataURL("image/png");
          const timestamp = new Date().toISOString();
          onSignatureChange(dataUrl, timestamp);
        }
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
    onSignatureChange(null, null);
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
        <span className="text-sm text-warning font-medium">
          ✍️ Customer signature required
        </span>
      </div>

      {/* Signature Canvas */}
      <div ref={containerRef} className="w-full">
        <div className="border-2 border-border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair touch-none"
            style={{ height: "200px" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Sign with your finger or stylus above
        </p>
      </div>

      {/* Clear Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[48px]"
        onClick={clearSignature}
        disabled={!hasSignature}
      >
        <Eraser className="h-5 w-5 mr-2" />
        Clear Signature
      </Button>

      {/* Signature Preview & Timestamp */}
      {signature && signatureTimestamp && (
        <div className="p-4 border rounded-lg bg-success/5 border-success/30 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-success flex items-center justify-center">
              <Check className="h-4 w-4 text-success-foreground" />
            </div>
            <span className="text-sm font-medium text-success">Signature Captured</span>
          </div>
          
          {/* Preview */}
          <div className="border rounded bg-white p-2">
            <img 
              src={signature} 
              alt="Customer signature" 
              className="w-full h-auto max-h-[100px] object-contain"
            />
          </div>
          
          {/* Timestamp */}
          <p className="text-xs text-muted-foreground">
            Signed: {formatTimestamp(signatureTimestamp)}
          </p>
        </div>
      )}
    </div>
  );
}
