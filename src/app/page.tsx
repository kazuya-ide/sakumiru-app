import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="px-6 py-20 md:py-32 text-center bg-gradient-to-b from-brand-50 to-white">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
          現場管理を、<span className="text-brand-600">シンプルに。</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          案件・工程・日報・原価・請求まで。建設業務に必要な機能を、月額 ¥4,800 から。
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700"
          >
            無料で始める
          </Link>
          <Link
            href="#pricing"
            className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
          >
            料金を見る
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">料金プラン</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <PricingCard
            name="Starter"
            price="¥4,800"
            features={["顧客管理", "案件管理", "見積管理", "請求管理"]}
          />
          <PricingCard
            name="Standard"
            price="¥9,800"
            highlight
            features={[
              "Starterの全機能",
              "スケジュール",
              "工事台帳",
              "ファイル管理",
              "作業日報",
              "写真管理",
            ]}
          />
          <PricingCard
            name="Business"
            price="¥19,800"
            features={[
              "Standardの全機能",
              "実行予算・原価管理",
              "出面管理",
              "発注・仕入管理",
            ]}
          />
        </div>
      </section>
    </main>
  );
}

function PricingCard({
  name,
  price,
  features,
  highlight,
}: {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-brand-600 shadow-lg ring-2 ring-brand-600 bg-brand-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <h3 className="text-xl font-bold mb-1">{name}</h3>
      <div className="text-3xl font-bold mb-1">
        {price}
        <span className="text-sm text-slate-500 font-normal">/月</span>
      </div>
      <ul className="mt-6 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="text-brand-600">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
