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

export async function sendCustomerOTPEmail(to: string, otp: string) {
  if (!emailProviderConfigured) return false

  const safeOtp = escapeHtml(otp)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject: 'Your MORJAL Enterprises sign-in code',
      text: `Your MORJAL Enterprises sign-in code is ${otp}. It expires in 5 minutes. If you did not request this, you can ignore this email.`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:32px 16px"><div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0"><div style="background:#073B82;padding:24px 32px;text-align:center"><p style="margin:0;color:#F5C451;font-size:12px;font-weight:bold;letter-spacing:3px">MORJAL ENTERPRISES</p><p style="margin:6px 0 0;color:#ffffff;font-size:18px;font-weight:bold">Sign in to your account</p></div><div style="padding:32px"><p style="margin:0 0 16px;color:#062653;font-size:15px">Use the code below to complete your passwordless sign-in. It is valid for <strong>5 minutes</strong>.</p><div style="text-align:center;margin:24px 0"><span style="display:inline-block;background:#f4f7fb;border:1px dashed #D9A72E;border-radius:12px;padding:16px 32px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#073B82">${safeOtp}</span></div><p style="margin:0;color:#475569;font-size:13px;line-height:1.6">If you did not request this code, you can safely ignore this email. Never share this code with anyone.</p></div><div style="background:#f4f7fb;padding:16px 32px;text-align:center"><p style="margin:0;color:#94a3b8;font-size:11px">MORJAL Enterprises &middot; Secure passwordless sign-in</p></div></div></div>`,
    }),
  })

  if (!response.ok) {
    console.error('Customer OTP email delivery failed with status', response.status)
    return false
  }
  return true
}
