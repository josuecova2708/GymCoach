function parseId(raw) {
  if (raw === undefined || raw === null) return null;
  if (!/^\d+$/.test(String(raw))) return null;
  return Number(raw);
}

module.exports = parseId;
