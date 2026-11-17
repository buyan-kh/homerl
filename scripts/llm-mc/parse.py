"""Parse compact .mc.txt authoring files and emit TypeScript decks."""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Make sibling emit.py importable
sys.path.insert(0, str(Path(__file__).resolve().parent))
from emit import CARDS, BY_ID, card, finish  # noqa: E402

KEY = re.compile(r"^(===|Q|G|AG|W|CODE|\+|-)\s?(.*)$")


def parse_file(path: Path) -> None:
    text = path.read_text()
    # Normalize newlines, reject typographic dashes later in card()
    blocks: list[dict] = []
    current: dict | None = None

    def flush_value():
        nonlocal current
        if current is None:
            return
        key = current.get("_key")
        if key is None:
            return
        val = current.get("_buf", "").rstrip("\n")
        if key == "+":
            current.setdefault("choices", [])
            current.setdefault("correct_at", len(current["choices"]))
            current["choices"].append(val)
        elif key == "-":
            current.setdefault("choices", [])
            current["choices"].append(val)
        elif key == "Q":
            current["prompt"] = val
        elif key == "G":
            current["diagram"] = val.strip()
        elif key == "AG":
            current["answer_diagram"] = val.strip()
        elif key == "W":
            current["why"] = val
        elif key == "CODE":
            current["code"] = True
        current["_key"] = None
        current["_buf"] = ""

    def start(src_id: str):
        nonlocal current
        if current is not None:
            flush_value()
            blocks.append(current)
        current = {"id": src_id.strip(), "choices": [], "correct_at": 0}

    for raw in text.splitlines():
        if raw.strip().startswith("#") and (current is None or current.get("_key") is None):
            continue
        m = KEY.match(raw)
        if m:
            kind, rest = m.group(1), m.group(2)
            if kind == "===":
                start(rest.strip())
                continue
            if current is None:
                raise SystemExit(f"{path}: item {kind} before ===")
            flush_value()
            current["_key"] = kind
            current["_buf"] = rest if kind != "CODE" else ""
            if kind == "CODE":
                current["code"] = True
                current["_key"] = None
            continue
        if current is None or current.get("_key") is None:
            if raw.strip() == "":
                continue
            raise SystemExit(f"{path}: loose line: {raw[:80]}")
        prev = current.get("_buf") or ""
        current["_buf"] = f"{prev}\n{raw}" if prev != "" else raw

    if current is not None:
        flush_value()
        blocks.append(current)

    for block in blocks:
        src_id = block["id"]
        if src_id not in BY_ID:
            raise SystemExit(f"{path}: unknown id {src_id}")
        choices = block["choices"]
        correct_at = block.get("correct_at", 0)
        if correct_at != 0:
            # Move the correct choice to index 0 for card()'s rotate helper.
            correct = choices.pop(correct_at)
            choices.insert(0, correct)
        card(
            src_id,
            choices,
            block["why"],
            prompt=block.get("prompt"),
            diagram=block.get("diagram"),
            answer_diagram=block.get("answer_diagram"),
            code=bool(block.get("code")),
        )


def main() -> None:
    here = Path(__file__).resolve().parent
    files = sorted(here.glob("*.mc.txt"))
    if not files:
        raise SystemExit("no .mc.txt files found")
    for path in files:
        before = len(CARDS)
        parse_file(path)
        print(f"parsed {path.name}: {len(CARDS) - before} cards")
    finish()


if __name__ == "__main__":
    main()
