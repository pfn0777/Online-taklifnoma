const WISH_NAME_MAX = 60;
const WISH_TEXT_MAX = 500;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateWish(body) {
  if (!isPlainObject(body)) return { error: 'Body must be an object' };
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!name || !text) return { error: 'name and text are required' };
  if (name.length > WISH_NAME_MAX) return { error: 'name is too long' };
  if (text.length > WISH_TEXT_MAX) return { error: 'text is too long' };
  return { value: { name, text } };
}

// Wishes live in their own table, so they are stripped from the invitation blob.
function validateInvitation(body) {
  if (!isPlainObject(body)) return { error: 'Body must be an object' };
  const { wishes, ...rest } = body;
  return { value: rest };
}

module.exports = { validateWish, validateInvitation, WISH_NAME_MAX, WISH_TEXT_MAX };
