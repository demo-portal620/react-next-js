"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { getGuideContent, GuideArea, GuideStep } from "@/content/userGuide";

function NumberedSteps({ steps }: { steps: GuideStep[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {i + 1}
          </span>
          <span>
            <span className="block text-sm font-medium text-gray-900">{step.title}</span>
            <span className="block text-sm text-gray-600">{step.body}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function NamedList({ items }: { items: GuideArea[] }) {
  return (
    <dl className="divide-y rounded-lg border bg-white">
      {items.map((item) => (
        <div key={item.name} className="px-4 py-3">
          <dt className="text-sm font-medium text-gray-900">{item.name}</dt>
          <dd className="mt-0.5 text-sm text-gray-600">{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}

// The four-step "how do I get in" - small enough to sit on the login page
// and inside the server-waking overlay.
export function QuickStart({ showFullGuideLink = true }: { showFullGuideLink?: boolean }) {
  const { i18n } = useTranslation();
  const guide = getGuideContent(i18n.language);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">{guide.quickStartTitle}</h2>
      <NumberedSteps steps={guide.quickStart} />
      {showFullGuideLink && (
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
        >
          <BookOpen className="h-4 w-4" />
          {guide.readFullGuide}
        </Link>
      )}
    </div>
  );
}

export function FullGuide() {
  const { i18n } = useTranslation();
  const guide = getGuideContent(i18n.language);

  return (
    <div className="space-y-10">
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{guide.waitingNote}</p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{guide.quickStartTitle}</h2>
        <NumberedSteps steps={guide.quickStart} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{guide.tryItTitle}</h2>
        <NumberedSteps steps={guide.tryIt} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{guide.areasTitle}</h2>
        <p className="text-sm text-gray-600">{guide.areasIntro}</p>
        <NamedList items={guide.areas} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{guide.mobileTitle}</h2>
        <p className="text-sm text-gray-600">{guide.mobileIntro}</p>
        <NamedList items={guide.mobile} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{guide.tipsTitle}</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600">
          {guide.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
