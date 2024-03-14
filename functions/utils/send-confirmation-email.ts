export async function sendConfirmationEmail(
  user: { email: string; username: string | null; confirmation_token: string },
  host: string,
) {
  return fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: user.email, name: user.username }],
        },
      ],
      from: {
        email: 'noreply@land-for-turn.pages.dev',
        name: 'Land for Turn',
      },
      subject: 'Confirm your email',
      content: [
        {
          type: 'text/plain',
          value: `Click here to confirm your email: https://${host}/api/users/confirm?confirmation_token=${user.confirmation_token}`,
        },
      ],
    }),
  });
}
