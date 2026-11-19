const emailProviderConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)

export function isCustomerEmailConfigured() {
  return emailProviderConfigured
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character)
}

export async function sendCustomerEmail(to: string, subject: string, text: string, link: string) {
  if (!emailProviderConfigured) return false

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      text: `${text}\n\n${link}\n\nIf you did not request this, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;color:#062653"><p>${escapeHtml(text)}</p><p><a href="${escapeHtml(link)}" style="display:inline-block;background:#073B82;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Continue to MORJAL Enterprises</a></p><p>If you did not request this, you can ignore this email.</p></div>`,
    }),
  })

  if (!response.ok) {
    console.error('Customer email delivery failed with status', response.status)
    return false
  }
  return true
}
