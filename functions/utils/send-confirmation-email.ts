export async function sendConfirmationEmail(
  user: { email: string; username: string | null; confirmation_token: string },
  apiKey: string,
) {
  const form = new FormData();
  form.append('from', 'noreply@mail.landforturn.com');
  form.append('to', user.email);
  form.append('subject', 'Confirm your email');
  form.append(
    'text',
    `Click here to confirm your email: https://landforturn.com/api/users/confirm?confirmation_token=${user.confirmation_token}`,
  );
  return fetch(`https://api.mailgun.net/v3/mail.landforturn.com/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
    },
    body: form,
  });
}
