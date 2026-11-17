"""Build TypeScript data files for the LLM multiple-choice section."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
SOURCE_CARDS = json.loads(Path("/tmp/llm-cards.json").read_text())
BY_ID = {c["id"]: c for c in SOURCE_CARDS}

CHAPTER = {
    "llm-p1-foundations.ts": "P1 Foundations",
    "llm-p2-kernels.ts": "P2 Kernels and GPUs",
    "llm-p3-architecture.ts": "P3 Architecture frontier",
    "llm-p4-pretraining.ts": "P4 Pretraining and scale",
    "llm-p5-post-training.ts": "P5 Post-training",
    "llm-rl.ts": "RL deep track",
    "llm-p6-evals.ts": "P6 Evals and graders",
    "llm-p7-interpretability.ts": "P7 Interpretability",
    "llm-p8-capstone.ts": "P8 Research taste and capstone",
}

EM_DASHES = ("\u2014", "\u2013", "\u2015", "\u2212")  # em, en, horz bar, minus (unicode minus only if misused)
# Allow regular hyphen-minus. Flag typographic dashes.
DASH_RE = re.compile(r"[\u2014\u2013\u2015]")

CARDS: list[dict] = []


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def rotate(choices: list[str], shift: int) -> tuple[list[str], int]:
    n = len(choices)
    shift = shift % n
    if shift == 0:
        return choices, 0
    rotated = choices[shift:] + choices[:shift]
    # original correct is index 0, new index is (0 - shift) % n = n - shift
    return rotated, (n - shift) % n


def card(
    src_id: str,
    choices: list[str],
    why: str,
    prompt: str | None = None,
    diagram: str | None = None,
    answer_diagram: str | None = None,
    code: bool = False,
    shift: int | None = None,
) -> dict:
    src = BY_ID[src_id]
    if len(choices) != 4:
        raise ValueError(f"{src_id}: expected 4 choices, got {len(choices)}")
    if any(not c.strip() for c in choices):
        raise ValueError(f"{src_id}: empty choice")
    if len(set(choices)) < 4:
        raise ValueError(f"{src_id}: duplicate choices")
    text_blobs = [why, prompt or src["prompt"], *choices]
    for blob in text_blobs:
        if DASH_RE.search(blob):
            raise ValueError(f"{src_id}: typographic dash in text: {blob[:80]}")
    if shift is None:
        # Mix the correct slot in a stable but varied way.
        shift = sum(ord(ch) for ch in src_id) % 4
    choices, correct = rotate(list(choices), shift)
    item = {
        "id": f"mc-{src_id}",
        "deck": "LLM Multiple Choice",
        "source": src.get("source") or "",
        "chapter": CHAPTER[src["file"]],
        "topic": src.get("chapter") or "",
        "prompt": prompt or src["prompt"],
        "choices": choices,
        "correctIndex": correct,
        "answer": choices[correct],
        "pattern": why,
        "choicesAreCode": code,
    }
    if diagram:
        item["diagram"] = diagram
    if answer_diagram:
        item["answerDiagram"] = answer_diagram
    CARDS.append(item)
    return item


def emit_ts(path: Path, export_name: str, cards: list[dict]) -> None:
    lines = [
        'import type { Question } from "../lib/types";',
        "",
        f"export const {export_name}: Question[] = [",
    ]
    for item in cards:
        lines.append("  {")
        for key in (
            "id",
            "deck",
            "source",
            "chapter",
            "topic",
            "prompt",
            "answer",
            "pattern",
        ):
            if item.get(key):
                lines.append(f"    {key}: {ts_string(item[key])},")
        lines.append("    choices: [")
        for choice in item["choices"]:
            lines.append(f"      {ts_string(choice)},")
        lines.append("    ],")
        lines.append(f"    correctIndex: {item['correctIndex']},")
        if item.get("choicesAreCode"):
            lines.append("    choicesAreCode: true,")
        if item.get("diagram"):
            lines.append(f"    diagram: {ts_string(item['diagram'])},")
        if item.get("answerDiagram"):
            lines.append(f"    answerDiagram: {ts_string(item['answerDiagram'])},")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    path.write_text("\n".join(lines))


def finish() -> None:
    missing = [c["id"] for c in SOURCE_CARDS if f"not-used"]
    have = {c["id"][3:] for c in CARDS}  # strip mc-
    expected = {c["id"] for c in SOURCE_CARDS}
    leftover = sorted(expected - have)
    extra = sorted(have - expected)
    if leftover:
        raise SystemExit(f"Missing {len(leftover)} cards, first: {leftover[:8]}")
    if extra:
        raise SystemExit(f"Unknown ids: {extra[:8]}")
    if len(CARDS) != len(SOURCE_CARDS):
        raise SystemExit(f"Count mismatch {len(CARDS)} vs {len(SOURCE_CARDS)}")

    by_file: dict[str, list[dict]] = defaultdict(list)
    export_names = {
        "P1 Foundations": "LLM_MC_P1",
        "P2 Kernels and GPUs": "LLM_MC_P2",
        "P3 Architecture frontier": "LLM_MC_P3",
        "P4 Pretraining and scale": "LLM_MC_P4",
        "P5 Post-training": "LLM_MC_P5",
        "RL deep track": "LLM_MC_RL",
        "P6 Evals and graders": "LLM_MC_P6",
        "P7 Interpretability": "LLM_MC_P7",
        "P8 Research taste and capstone": "LLM_MC_P8",
    }
    file_names = {
        "LLM_MC_P1": "llm-mc-p1.ts",
        "LLM_MC_P2": "llm-mc-p2.ts",
        "LLM_MC_P3": "llm-mc-p3.ts",
        "LLM_MC_P4": "llm-mc-p4.ts",
        "LLM_MC_P5": "llm-mc-p5.ts",
        "LLM_MC_RL": "llm-mc-rl.ts",
        "LLM_MC_P6": "llm-mc-p6.ts",
        "LLM_MC_P7": "llm-mc-p7.ts",
        "LLM_MC_P8": "llm-mc-p8.ts",
    }
    for item in CARDS:
        by_file[export_names[item["chapter"]]].append(item)

    exports = []
    for export, fname in file_names.items():
        emit_ts(DATA / fname, export, by_file[export])
        exports.append((export, fname, len(by_file[export])))
        print(f"wrote {fname}: {len(by_file[export])} cards")

    all_path = DATA / "llm-multiple-choice.ts"
    imports = "\n".join(
        f'import {{ {export} }} from "./{fname[:-3]}";' for export, fname, _ in exports
    )
    concat = ",\n  ...".join(export for export, _, _ in exports)
    all_path.write_text(
        'import type { Question } from "../lib/types";\n'
        + imports
        + "\n\nexport const LLM_MULTIPLE_CHOICE: Question[] = [\n  ..."
        + concat
        + ",\n];\n"
    )
    print("total", len(CARDS), "->", all_path)
