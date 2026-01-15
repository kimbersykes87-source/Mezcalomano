export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;
  return (
    <section className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Account access</h1>
      <p className="mt-2 text-sm text-slate-600">Request a magic link to view your orders and preferences.</p>
      <form action="/api/account/request-magic" method="post" className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-600">Email</label>
          <input
            type="email"
            name="email"
            required
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-500">
          Turnstile widget placeholder (client integration required).
          <input type="hidden" name="turnstileToken" value="dev-token" />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Send magic link
        </button>
      </form>
      {params?.sent ? <p className="mt-4 text-sm text-slate-500">Check your inbox.</p> : null}
    </section>
  );
}
