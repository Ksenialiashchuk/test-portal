export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err == null) return fallback;
  const ax = err as { response?: { data?: { error?: { message?: string }; message?: string }; status?: number }; message?: string };
  const msg = ax.response?.data?.error?.message ?? ax.response?.data?.message ?? ax.message;
  if (typeof msg === 'string' && msg.length > 0) return msg;
  if (ax.response?.status === 403) return 'You do not have permission to do this';
  if (ax.response?.status === 404) return 'Not found';
  if (ax.response?.status && ax.response.status >= 500) return 'Server error. Please try again later';
  if (typeof ax.message === 'string' && ax.message.length > 0) return ax.message;
  return fallback;
}
