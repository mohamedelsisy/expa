function splitSentence(sentence) {
  const i = sentence.indexOf("___");
  if (i < 0 || sentence.indexOf("___", i + 3) >= 0) return null;
  return { before: sentence.slice(0, i).trimEnd(), after: sentence.slice(i + 3).trimStart() };
}
function correctAnswerText(ex, correct) {
  var _a, _b, _c, _d, _e;
  const c = correct != null ? correct : {};
  if (ex.type === "multiple_choice" || ex.type === "listening") return (_c = (_b = (_a = ex.form.choices) == null ? void 0 : _a.find((x) => x.index === c.index)) == null ? void 0 : _b.text) != null ? _c : null;
  if (ex.type === "fill_blank") return Array.isArray(c.answers) && c.answers.length ? c.answers.join(" / ") : null;
  if (ex.type === "match" && Array.isArray(c.right_ids)) {
    const left = (_d = ex.form.left) != null ? _d : [];
    const right = new Map(((_e = ex.form.right) != null ? _e : []).map((r) => [r.id, r.text]));
    return left.map((l, i) => {
      var _a2;
      return `${l.text} = ${(_a2 = right.get(c.right_ids[i])) != null ? _a2 : "?"}`;
    }).join("; ");
  }
  return null;
}
function sessionSummary(results) {
  const correct = results.filter(Boolean).length;
  return { total: results.length, correct, percent: results.length ? Math.round(correct / results.length * 100) : null };
}

export { splitSentence as a, correctAnswerText as c, sessionSummary as s };
//# sourceMappingURL=practice-BYRJH4K6.mjs.map
