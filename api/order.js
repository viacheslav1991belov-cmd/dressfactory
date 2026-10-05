// Заявка с сайта: проверяем поля и пересылаем в Telegram.
// Токен бота и id чата берутся из настроек проекта в Vercel: TG_BOT_TOKEN и TG_CHAT_ID.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  // скрытое поле: люди его не видят, а спам-боты заполняют
  if (b.website) return res.status(200).json({ ok: true });
  const clean = (s, n) => String(s || '').replace(/[<>]/g, '').trim().slice(0, n);
  const name = clean(b.name, 100), contact = clean(b.contact, 120), msg = clean(b.msg, 2000);
  if (!name || !contact) return res.status(400).json({ ok: false, error: 'empty' });
  const token = process.env.TG_BOT_TOKEN, chat = process.env.TG_CHAT_ID;
  if (!token || !chat) return res.status(503).json({ ok: false, error: 'not_configured' });
  const text = 'Заявка с сайта dressfactory.ru\n\nИмя: ' + name + '\nКонтакт: ' + contact + (msg ? '\nКомментарий: ' + msg : '');
  try {
    const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text })
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
};
