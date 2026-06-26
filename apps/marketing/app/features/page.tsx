import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Section } from '@/components/Section';
import { StartDrawingCta } from '@/components/StartDrawingCta';
import { LANDING_SECTIONS } from '@/lib/landing-content';
import { subpageMetadata } from '@/lib/subpage-metadata';

// The feature index: one entry per category, each linking to its own
// /features/<id> detail page (see specs/16-marketing-site.md "Feature category
// pages"). Mirrors the /alternatives hub. Built straight from LANDING_SECTIONS
// so a new section appears here, on the landing page, and in the sitemap from a
// single edit.

export const metadata: Metadata = subpageMetadata({
  title: 'Features — livediagram',
  description:
    'Everything livediagram can do, by category: the canvas, collaboration, customisation, animation, tabs, reliability, and more. Pick a category to explore it in depth.',
  path: '/features',
});

export default function FeaturesHubPage() {
  return (
    <>
      <BreadcrumbJsonLd name="Features" path="/features" />
      <Header />
      <main>
        <Breadcrumb items={[{ label: 'Features' }]} />
        <Section
          title="Everything livediagram can do"
          description="Browse the product by category. Each one opens onto the full set of features it covers."
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`/features/${section.id}`}
                className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {section.description}
                </p>
                <span className="mt-4 text-sm font-medium text-brand-600 group-hover:text-brand-700">
                  {section.items.length} feature{section.items.length === 1 ? '' : 's'} →
                </span>
              </a>
            ))}
          </div>
        </Section>
        <StartDrawingCta />
      </main>
      <Footer />
    </>
  );
}
