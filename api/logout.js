function clearCookie(name) {
  return [
    `${name}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0'
  ].join('; ');
}

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', clearCookie('dlynee_session'));
  return res.status(200).json({ ok: true });
}
