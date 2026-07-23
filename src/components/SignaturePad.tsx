"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import SignaturePadLib from "signature_pad";

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
  fromDataURL: (dataUrl: string) => void;
}

interface Props {
  initialValue?: string | null;
  onChange?: (dataUrl: string | null) => void;
}

const SignaturePad = forwardRef<SignaturePadHandle, Props>(function SignaturePad(
  { initialValue, onChange },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const data = padRef.current?.toData();
      canvas!.width = canvas!.offsetWidth * ratio;
      canvas!.height = canvas!.offsetHeight * ratio;
      canvas!.getContext("2d")?.scale(ratio, ratio);
      if (padRef.current && data && data.length) {
        padRef.current.clear();
        padRef.current.fromData(data);
      }
    }

    padRef.current = new SignaturePadLib(canvas, {
      backgroundColor: "rgba(255,255,255,1)",
    });
    resize();

    if (initialValue) {
      padRef.current.fromDataURL(initialValue);
      setSigned(true);
    }

    padRef.current.addEventListener("endStroke", () => {
      setSigned(!padRef.current!.isEmpty());
      onChange?.(padRef.current!.isEmpty() ? null : padRef.current!.toDataURL());
    });

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    clear: () => {
      padRef.current?.clear();
      setSigned(false);
      onChange?.(null);
    },
    isEmpty: () => padRef.current?.isEmpty() ?? true,
    toDataURL: () => padRef.current?.toDataURL() ?? "",
    fromDataURL: (dataUrl: string) => {
      padRef.current?.fromDataURL(dataUrl);
      setSigned(true);
    },
  }));

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full h-32 bg-white border border-dashed border-line rounded-lg touch-none"
      />
      <div className="flex items-center justify-between mt-2">
        <span
          className={`text-xs ${
            signed ? "text-ok font-semibold" : "text-ink-soft"
          }`}
        >
          {signed ? "Signed ✓" : "Not signed"}
        </span>
        <button
          type="button"
          onClick={() => {
            padRef.current?.clear();
            setSigned(false);
            onChange?.(null);
          }}
          className="text-xs font-semibold border border-line rounded-md px-2.5 py-1 hover:bg-[#F7F8FA]"
        >
          Clear
        </button>
      </div>
    </div>
  );
});

export default SignaturePad;
