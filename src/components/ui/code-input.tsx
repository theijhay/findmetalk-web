"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export const CODE_INPUT_LENGTH = 6;

export interface CodeInputProps {
  value: string;
  onChange: (nextValue: string) => void;
  label: string;
  digitLabelTemplate: (index: number, total: number) => string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Six-digit one-time code input (spec 7.1 step 2, FR-AUTH-1).
 * Supports keyboard navigation (ArrowLeft, ArrowRight, Backspace) and pasting.
 */
export function CodeInput({
  value,
  onChange,
  label,
  digitLabelTemplate,
  hint,
  error,
  disabled = false,
  className,
}: CodeInputProps) {
  const groupId = React.useId();
  const hintId = hint ? `${groupId}-hint` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: CODE_INPUT_LENGTH }, (_, idx) => {
    const ch = value[idx] ?? "";
    return /^\d$/.test(ch) ? ch : "";
  });

  const updateAt = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(""));
  };

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(CODE_INPUT_LENGTH - 1, index));
    inputRefs.current[clamped]?.focus();
    inputRefs.current[clamped]?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      updateAt(index, "");
      return;
    }
    if (cleaned.length > 1) {
      const next = [...digits];
      for (let i = 0; i < cleaned.length && index + i < CODE_INPUT_LENGTH; i += 1) {
        next[index + i] = cleaned[i] ?? "";
      }
      onChange(next.join(""));
      focusBox(Math.min(CODE_INPUT_LENGTH - 1, index + cleaned.length));
      return;
    }
    updateAt(index, cleaned);
    if (index < CODE_INPUT_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    } else if (event.key === "Backspace") {
      if (digits[index]) {
        updateAt(index, "");
      } else if (index > 0) {
        event.preventDefault();
        updateAt(index - 1, "");
        focusBox(index - 1);
      }
    }
  };

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length && index + i < CODE_INPUT_LENGTH; i += 1) {
      next[index + i] = pasted[i] ?? "";
    }
    onChange(next.join(""));
    focusBox(Math.min(CODE_INPUT_LENGTH - 1, index + pasted.length));
  };

  return (
    <fieldset className={cn("flex flex-col gap-2", className)} aria-describedby={describedBy}>
      <legend className="text-sm font-medium text-ink break-words">{label}</legend>
      <div className="mt-1.5 grid grid-cols-6 gap-2 sm:max-w-xs">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={6}
            value={digit}
            disabled={disabled}
            aria-label={digitLabelTemplate(index + 1, CODE_INPUT_LENGTH)}
            aria-invalid={error ? true : undefined}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
            className={cn(
              "min-h-target min-w-target w-full rounded-[var(--radius-control)] border bg-surface text-center text-lg font-semibold text-ink",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-calm)]",
              "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-60",
              error ? "border-danger" : "border-line-strong",
            )}
          />
        ))}
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-xs text-ink-secondary break-words">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-xs font-medium text-danger break-words">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </p>
      ) : null}
    </fieldset>
  );
}
