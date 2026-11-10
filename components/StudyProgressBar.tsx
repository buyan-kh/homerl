"use client";

import type { CSSProperties } from "react";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";

type StudyProgressBarProps = {
  label: string;
  learned: number;
  total: number;
  isLabelHidden?: boolean;
  hasValueLabel?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function StudyProgressBar({
  label,
  learned,
  total,
  isLabelHidden = false,
  hasValueLabel = true,
  className,
  style,
}: StudyProgressBarProps) {
  const max = Math.max(total, 1);
  const complete = total > 0 && learned >= total;

  return (
    <ProgressBar
      label={label}
      value={learned}
      max={max}
      isLabelHidden={isLabelHidden}
      hasValueLabel={hasValueLabel}
      formatValueLabel={(value, maximum) => `${value} / ${maximum}`}
      variant={complete ? "success" : "accent"}
      className={className}
      style={style}
    />
  );
}
