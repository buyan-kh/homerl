"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

type DrillReactionsProps = {
  /** Grade actions only after the model answer is visible */
  canGrade: boolean;
  problemLiked: boolean;
  savedComment?: string;
  onToggleProblemLike: () => void;
  onMissed: () => void;
  onCommentSave: (note: string) => void;
  onGotIt: () => void;
};

export function DrillReactions({
  canGrade,
  problemLiked,
  savedComment = "",
  onToggleProblemLike,
  onMissed,
  onCommentSave,
  onGotIt,
}: DrillReactionsProps) {
  const formId = useId();
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState(savedComment);
  const [commentSaved, setCommentSaved] = useState(Boolean(savedComment));
  const [gotItActive, setGotItActive] = useState(false);

  useEffect(() => {
    setCommentOpen(false);
    setCommentDraft(savedComment);
    setCommentSaved(Boolean(savedComment));
    setGotItActive(false);
  }, [canGrade, savedComment]);

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const note = String(data.get("note") ?? "").trim();
    if (!note) return;
    onCommentSave(note);
    setCommentSaved(true);
    setCommentOpen(false);
  }

  function toggleComment() {
    if (!canGrade) return;
    setCommentOpen((open) => !open);
  }

  return (
    <div className="flex w-full flex-col items-start gap-3">
      <style href="ui-drill-reactions" precedence="default">
        {css}
      </style>
      <MotionDirections />
      <h3 className="text-sm font-medium text-foreground">How did you do?</h3>
      <div className="ui-drill-rbc" role="group" aria-label="Grade this card">
        <button
          type="button"
          className="ui-drill-rbc__btn"
          data-tone={commentSaved ? "good" : commentOpen ? "open" : "neutral"}
          aria-pressed={commentOpen}
          aria-label="Comment — note what you almost had"
          title={canGrade ? (commentOpen ? "Close comment" : "Comment") : "Reveal the answer first"}
          disabled={!canGrade}
          onClick={toggleComment}
        >
          <IconComment />
        </button>
        <button
          type="button"
          className="ui-drill-rbc__btn"
          data-tone={problemLiked ? "love" : "neutral"}
          aria-pressed={problemLiked}
          aria-label={problemLiked ? "Unlike this problem" : "Like this problem"}
          title="Like this problem"
          onClick={onToggleProblemLike}
        >
          <IconHeart />
        </button>
        <button
          type="button"
          className="ui-drill-rbc__btn"
          data-tone={gotItActive ? "good" : "neutral"}
          aria-pressed={gotItActive}
          aria-label="Got it"
          title={canGrade ? "Got it" : "Reveal the answer first"}
          disabled={!canGrade || gotItActive}
          onClick={() => {
            if (!canGrade || gotItActive) return;
            setGotItActive(true);
            onGotIt();
          }}
        >
          <IconCheck />
        </button>
      </div>
      {canGrade ? (
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={onMissed}
          disabled={gotItActive}
        >
          I missed it
        </button>
      ) : null}
      {commentOpen ? (
        <form
          id={formId}
          className="ui-drill-rbc__comment"
          onSubmit={submitComment}
        >
          <label className="sr-only" htmlFor={`${formId}-note`}>
            Short note on what you almost had right
          </label>
          <input
            id={`${formId}-note`}
            name="note"
            className="ui-drill-rbc__input"
            placeholder="What did you get close on?"
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" className="ui-drill-rbc__submit">
            Save
          </button>
        </form>
      ) : null}
    </div>
  );
}

/** Explainer copy for docs / screen readers (rendered off-screen). */
function MotionDirections() {
  return (
    <p className="sr-only">
      Heart likes this problem and turns red; it does not change your grade. Comment toggles a note field;
      saving stores your note and turns the icon green.
    </p>
  );
}

function IconComment() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="ui-drill-rbc__fill" d="M12 21.5c5.52 0 10-4.25 10-9.5S17.52 2.5 12 2.5 2 6.75 2 12c0 1.36.3 2.65.84 3.82.15.31.2.66.1 1l-.6 2.23a1.08 1.08 0 0 0 1.6 1.59l2.22-.6c.34-.09.69-.04 1 .1 1.17.55 2.46.86 4.84.86Z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5 10 17.5 19 7.5" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="ui-drill-rbc__fill" d="M19.46 4c-2.68-1.65-5.02-.99-6.43.07-.57.43-.86.65-1.03.65s-.46-.22-1.03-.65C9.56 3.01 7.22 2.35 4.54 4 1.02 6.15.22 13.27 8.34 19.28 9.89 20.43 10.66 21 12 21s2.11-.57 3.66-1.72C23.78 13.27 22.98 6.15 19.46 4Z" />
    </svg>
  );
}

const css = /* css */ `
.ui-drill-rbc {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.ui-drill-rbc__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.06);
  background: transparent;
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  transition: background-color 140ms ease, box-shadow 140ms ease, color 140ms ease;
}
.ui-drill-rbc__btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.88);
}
.ui-drill-rbc__btn:disabled { opacity: 0.45; cursor: default; }
.ui-drill-rbc__btn[data-tone="love"] {
  background: rgba(240, 68, 56, 0.1);
  box-shadow: inset 0 0 0 0.5px rgba(240, 68, 56, 0.35);
  color: #f04438;
}
.ui-drill-rbc__btn[data-tone="love"] .ui-drill-rbc__fill { fill: currentColor; }
.ui-drill-rbc__btn[data-tone="good"] {
  background: rgba(95, 200, 138, 0.12);
  box-shadow: inset 0 0 0 0.5px rgba(30, 138, 79, 0.35);
  color: #1e8a4f;
}
.ui-drill-rbc__btn[data-tone="good"] .ui-drill-rbc__fill { fill: currentColor; }
.ui-drill-rbc__btn[data-tone="open"] {
  box-shadow: inset 0 0 0 0.5px rgba(0, 96, 226, 0.35);
  color: rgba(0, 96, 226, 0.85);
}
.ui-drill-rbc__fill { fill: transparent; transition: fill 140ms ease; }
.ui-drill-rbc__comment {
  display: flex;
  width: 100%;
  max-width: 20rem;
  gap: 6px;
  align-items: center;
}
.ui-drill-rbc__input {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  font-size: 13px;
}
.ui-drill-rbc__submit {
  height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.88);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;
