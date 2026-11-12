/* homeRL LeetCode runner. Runs Python with Pyodide inside a Web Worker so the page
   stays responsive and the main thread can terminate a run that loops forever. */
const PYODIDE_VERSION = "0.29.5";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const HARNESS = "import json, io, copy, math, traceback, contextlib, sys\n\ndef _norm(v):\n    if isinstance(v, tuple):\n        return [_norm(x) for x in v]\n    if isinstance(v, list):\n        return [_norm(x) for x in v]\n    if isinstance(v, dict):\n        return {str(k): _norm(x) for k, x in v.items()}\n    if isinstance(v, (set, frozenset)):\n        return sorted((_norm(x) for x in v), key=repr)\n    return v\n\ndef _key(v):\n    return json.dumps(v, sort_keys=True, default=repr)\n\ndef _floats_equal(a, b, tol=1e-6):\n    if isinstance(a, bool) or isinstance(b, bool):\n        return a == b\n    if isinstance(a, (int, float)) and isinstance(b, (int, float)):\n        if isinstance(a, float) and math.isnan(a):\n            return isinstance(b, float) and math.isnan(b)\n        return abs(a - b) <= tol * max(1.0, abs(a), abs(b))\n    if isinstance(a, list) and isinstance(b, list):\n        return len(a) == len(b) and all(_floats_equal(x, y, tol) for x, y in zip(a, b))\n    if isinstance(a, dict) and isinstance(b, dict):\n        return a.keys() == b.keys() and all(_floats_equal(a[k], b[k], tol) for k in a)\n    return a == b\n\ndef _same(got, expected, compare):\n    got = _norm(got)\n    if compare == \"float\":\n        return _floats_equal(got, expected)\n    if compare == \"unordered\":\n        if not isinstance(got, list) or not isinstance(expected, list):\n            return False\n        return sorted(map(_key, got)) == sorted(map(_key, expected))\n    if compare == \"unordered_nested\":\n        if not isinstance(got, list) or not isinstance(expected, list):\n            return False\n        if not all(isinstance(x, list) for x in got):\n            return False\n        inner = lambda xs: sorted(_key(sorted(map(_key, x))) for x in xs)\n        return inner(got) == inner(expected)\n    return got == expected\n\ndef _short(v, limit=300):\n    s = repr(v)\n    return s if len(s) <= limit else s[: limit - 3] + \"...\"\n\ndef _clean_tb():\n    etype, e, tb = sys.exc_info()\n    frames = [f for f in traceback.extract_tb(tb) if f.filename == \"solution.py\"]\n    lines = [\"Traceback (most recent call last):\"] if frames else []\n    for f in frames:\n        lines.append(f\"  line {f.lineno}, in {f.name}\")\n    lines += [x.rstrip(\"\\n\") for x in traceback.format_exception_only(etype, e)]\n    return \"\\n\".join(lines)[-1500:]\n\ndef run_code(code):\n    out = io.StringIO()\n    ns = {\"__name__\": \"__main__\"}\n    error = None\n    try:\n        compiled = compile(code, \"solution.py\", \"exec\")\n        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):\n            exec(compiled, ns)\n    except BaseException:\n        error = _clean_tb()\n    return json.dumps({\"stdout\": out.getvalue()[-8000:], \"error\": error})\n\ndef _call_class(ns, func, args):\n    ops, params = args\n    obj = None\n    outputs = []\n    for op, p in zip(ops, params):\n        if obj is None:\n            obj = ns[func](*copy.deepcopy(p))\n            outputs.append(None)\n        else:\n            outputs.append(getattr(obj, op)(*copy.deepcopy(p)))\n    return outputs\n\ndef run_tests(code, func, tests_json, compare=\"exact\", mode=\"func\"):\n    tests = json.loads(tests_json)\n    out = io.StringIO()\n    ns = {\"__name__\": \"solution\"}\n    try:\n        compiled = compile(code, \"solution.py\", \"exec\")\n        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):\n            exec(compiled, ns)\n    except BaseException:\n        return json.dumps({\"fatal\": _clean_tb(), \"stdout\": out.getvalue()[-4000:], \"results\": []})\n    if func not in ns:\n        return json.dumps({\"fatal\": f\"Define {func} so the checker can call it.\", \"stdout\": out.getvalue()[-4000:], \"results\": []})\n    results = []\n    for t in tests:\n        args = t[\"args\"]\n        expected = t[\"expected\"]\n        shown = (\n            f\"{func}(\" + \", \".join(_short(a, 200) for a in args) + \")\"\n            if mode == \"func\"\n            else f\"{func}: ops={_short(args[0], 150)}, args={_short(args[1], 150)}\"\n        )\n        try:\n            with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):\n                if mode == \"class\":\n                    got = _call_class(ns, func, args)\n                else:\n                    got = ns[func](*copy.deepcopy(args))\n            ok = _same(got, expected, compare)\n            results.append({\"input\": shown, \"expected\": _short(expected), \"got\": _short(_norm(got)), \"ok\": bool(ok)})\n        except RecursionError:\n            results.append({\"input\": shown, \"expected\": _short(expected), \"got\": \"RecursionError: maximum recursion depth exceeded\", \"ok\": False})\n        except BaseException as e:\n            results.append({\"input\": shown, \"expected\": _short(expected), \"got\": f\"{type(e).__name__}: {e}\"[:400], \"ok\": False})\n    return json.dumps({\"fatal\": None, \"stdout\": out.getvalue()[-4000:], \"results\": results})\n";

importScripts(`${INDEX_URL}pyodide.js`);

const ready = (async () => {
  const py = await loadPyodide({ indexURL: INDEX_URL });
  py.FS.mkdirTree("/home/pyodide");
  py.FS.writeFile("/home/pyodide/lc_harness.py", HARNESS);
  py.runPython("import sys\nsys.path.insert(0, '/home/pyodide')\nimport lc_harness\nsys.setrecursionlimit(3000)");
  return py;
})();

self.onmessage = async (event) => {
  const { id, type } = event.data;
  try {
    const py = await ready;
    if (type === "load") {
      self.postMessage({ id, ok: true });
      return;
    }
    const g = py.globals;
    g.set("_lc_code", event.data.code ?? "");
    let out;
    if (type === "run") {
      out = py.runPython("lc_harness.run_code(_lc_code)");
    } else {
      g.set("_lc_func", event.data.func);
      g.set("_lc_tests", event.data.tests);
      g.set("_lc_compare", event.data.compare ?? "exact");
      g.set("_lc_mode", event.data.mode ?? "func");
      out = py.runPython("lc_harness.run_tests(_lc_code, _lc_func, _lc_tests, _lc_compare, _lc_mode)");
    }
    self.postMessage({ id, ok: true, result: JSON.parse(out) });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err && err.message ? err.message : err) });
  }
};
