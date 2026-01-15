import ManageCookies from "@/components/manage-cookies";

export default function CookiesPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Cookie Policy</h1>
      <div className="mt-6 space-y-4 text-sm text-slate-600">
        <p>We use essential cookies to run the shop and remember your preferences.</p>
        <p>Analytics cookies are used only after consent is granted in regions where consent is required.</p>
        <p>Use the banner or manage cookies link to change your consent at any time.</p>
      </div>
      <ManageCookies />
    </section>
  );
}
