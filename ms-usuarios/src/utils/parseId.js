function parseId(raw) {
  if (!/^\d+$/.test(String(raw))) return null;
  return Number(raw);
}

module.exports = parseId;
