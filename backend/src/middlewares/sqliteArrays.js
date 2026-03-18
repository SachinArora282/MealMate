/**
 * SQLite stores arrays as JSON strings.
 * This middleware parses them back to real arrays before sending responses.
 */

const JSON_ARRAY_FIELDS = ['cuisine', 'tags'];

function parseJsonArrays(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(parseJsonArrays);

  const result = { ...obj };
  for (const field of JSON_ARRAY_FIELDS) {
    if (typeof result[field] === 'string') {
      try { result[field] = JSON.parse(result[field]); } catch { result[field] = []; }
    }
  }
  // Recurse into nested objects (e.g. dish.restaurant)
  for (const key of Object.keys(result)) {
    if (result[key] && typeof result[key] === 'object') {
      result[key] = parseJsonArrays(result[key]);
    }
  }
  return result;
}

function sqliteArrayParser(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    return originalJson(parseJsonArrays(data));
  };
  next();
}

module.exports = { sqliteArrayParser, parseJsonArrays };
