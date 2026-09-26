import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export interface Recipient {
  name: string
  email: string
}

/**
 * Sends one email per recipient via EmailJS. The template must have a "To Email" field
 * bound to {{to_email}} in the EmailJS dashboard. Returns recipients that failed.
 */
export async function sendToRecipients(
  recipients: Recipient[],
  subject: string,
  message: string,
): Promise<{ sent: number; failed: Recipient[] }> {
  let sent = 0
  const failed: Recipient[] = []

  for (const r of recipients) {
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { to_email: r.email, to_name: r.name, subject, message },
        { publicKey: PUBLIC_KEY },
      )
      sent++
    } catch {
      failed.push(r)
    }
  }

  return { sent, failed }
}
