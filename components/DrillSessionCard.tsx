"use client";

import { Button } from "@/components/ui/button-clean";
import { StudyProgressBar } from "@/components/StudyProgressBar";

type DrillSessionCardProps = {
  title: string;
  solid: number;
  missed: number;
  reviewed: number;
  learned: number;
  total: number;
  remaining: number;
  onReset: () => void;
  onEndSession?: () => void;
};

export function DrillSessionCard({
  title,
  solid,
  missed,
  reviewed,
  learned,
  total,
  remaining,
  onReset,
  onEndSession,
}: DrillSessionCardProps) {
  const rows = [
    { label: "Solid", value: solid, tone: "good" as const },
    { label: "Missed", value: missed, tone: "bad" as const },
    { label: "Reviewed", value: reviewed, tone: "neutral" as const },
  ];

  return (
    <section className="ui-dsc" aria-label={title}>
      <style href="ui-drill-session-card" precedence="default">
        {css}
      </style>
      <header className="ui-dsc__title" title={title}>
        {title}
      </header>
      <dl className="ui-dsc__rows">
        {rows.map((row) => (
          <div key={row.label} className="ui-dsc__row">
            <dt>{row.label}</dt>
            <dd data-tone={row.value > 0 ? row.tone : "neutral"}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="ui-dsc__progress">
        <div className="ui-dsc__row">
          <span>Learned</span>
          <span className="ui-dsc__count">
            {learned} / {total}
          </span>
        </div>
        <StudyProgressBar label="Learned" learned={learned} total={total} isLabelHidden hasValueLabel={false} />
        <p className="ui-dsc__note">{remaining} still in rotation</p>
      </div>
      <footer className="ui-dsc__foot">
        {onEndSession ? (
          <Button type="button" size="sm" onClick={onEndSession}>
            End session
          </Button>
        ) : null}
        <Button type="button" variant="secondary" size="sm" onClick={onReset}>
          Reset memory
        </Button>
      </footer>
    </section>
  );
}

const css = /* css */ `
.ui-dsc {
  --ui-dsc-card: #ffffff;
  --ui-dsc-ink: rgba(0, 0, 0, 0.88);
  --ui-dsc-text: rgba(0, 0, 0, 0.61);
  --ui-dsc-muted: rgba(0, 0, 0, 0.45);
  --ui-dsc-line: rgba(0, 0, 0, 0.06);
  --ui-dsc-good: #1e8a4f;
  --ui-dsc-bad: #f04438;
  --ui-dsc-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  border-radius: 10px;
  background: var(--ui-dsc-card);
  box-shadow: var(--ui-dsc-shadow);
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-dsc-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-dsc *, .ui-dsc *::before, .ui-dsc *::after { box-sizing: border-box; }
.ui-dsc__title {
  padding: 14px 16px 12px;
  font-weight: 500;
  overflow-wrap: anywhere;
  white-space: normal;
}
.ui-dsc__rows { margin: 0; }
.ui-dsc__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 36px;
  margin: 0;
  padding: 0 16px;
  border-top: 0.5px solid var(--ui-dsc-line);
}
.ui-dsc__row dt,
.ui-dsc__row > span:first-child {
  margin: 0;
  font-weight: 500;
  color: var(--ui-dsc-ink);
}
.ui-dsc__row dd,
.ui-dsc__count {
  margin: 0;
  font-variant-numeric: tabular-nums;
  color: var(--ui-dsc-text);
}
.ui-dsc__row dd[data-tone="good"] { color: var(--ui-dsc-good); }
.ui-dsc__row dd[data-tone="bad"] { color: var(--ui-dsc-bad); }
.ui-dsc__progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 0 12px;
  border-top: 0.5px solid var(--ui-dsc-line);
}
.ui-dsc__progress .ui-dsc__row { border-top: none; }
.ui-dsc__progress > :not(.ui-dsc__row):not(.ui-dsc__note) { padding: 0 16px; }
.ui-dsc__note {
  margin: 0;
  padding: 0 16px;
  font-size: 12px;
  line-height: 16px;
  color: var(--ui-dsc-muted);
}
.ui-dsc__foot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-top: 0.5px solid var(--ui-dsc-line);
}
`;
