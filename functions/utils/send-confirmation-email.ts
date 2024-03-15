export async function sendConfirmationEmail(
  user: { email: string; username: string | null; confirmation_token: string },
  apiKey: string,
) {
  const confirmUrl = `https://landforturn.com/api/users/confirm?confirmation_token=${user.confirmation_token}`;
  const form = new FormData();
  form.append('from', 'noreply@mail.landforturn.com');
  form.append('to', user.email);
  form.append('subject', 'Confirm your email');
  form.append(
    'html',
    `Click here to confirm your email: <a href="${confirmUrl}">${confirmUrl}</a>`,
  );
  return fetch(`https://api.mailgun.net/v3/mail.landforturn.com/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(unescape(encodeURIComponent(`api:${apiKey}`)))}`,
    },
    body: form,
  });
}
