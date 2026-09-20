const TOKEN_SECRET_MIN_LEN = 32;
const DEFAULT_PORT = 3100;

function readConfig(env) {
  const missing = ['ADMIN_PASSWORD_HASH', 'TOKEN_SECRET', 'ALLOWED_ORIGIN'].filter(k => !env[k]);
  if (missing.length) throw new Error('Missing env: ' + missing.join(', '));
  if (env.TOKEN_SECRET.length < TOKEN_SECRET_MIN_LEN) {
    throw new Error('TOKEN_SECRET must be at least ' + TOKEN_SECRET_MIN_LEN + ' characters');
  }

  return {
    port: Number(env.PORT) || DEFAULT_PORT,
    dbFile: env.DB_FILE || 'taklifnoma.db',
    adminPasswordHash: env.ADMIN_PASSWORD_HASH,
    tokenSecret: env.TOKEN_SECRET,
    allowedOrigins: env.ALLOWED_ORIGIN.split(',').map(s => s.trim()).filter(Boolean),
    trustProxy: env.TRUST_PROXY === '1'
  };
}

module.exports = { readConfig };
