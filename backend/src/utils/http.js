function ok(res, data, message) {
  res.json({
    code: 0,
    message: message || "成功",
    data
  });
}

function fail(res, status, code, message, data) {
  res.status(status).json({
    code,
    message,
    data: data || null
  });
}

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  return fallback;
}

module.exports = {
  ok,
  fail,
  readPositiveInt
};
