import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { FeatureGrid, Section } from '@/components/Section';
import { StartDrawingCta } from '@/components/StartDrawingCta';
import { getLandingSection, LANDING_SECTION_IDS } from '@/lib/landing-content';
import { subpageMetadata } from '@/lib/subpage-metadata';

// One detail page per feature category at /features/<id>, reading the matching
// LANDING_SECTIONS entry (see specs/16-marketing-site.md "Feature category
// pages"). The landing page advertises each category in a compact block; the
// full grid of feature cards lives here. Static export: only the known section
// ids are generated, so an unknown slug 404s at build rather than rendering.
export const dynamicParams = false;

export function generateStaticParams() {
  return LANDING_SECTION_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const section = getLandingSection(slug);
  if (!section) return {};
  return subpageMetadata({
    title: `${section.title} — livediagram features`,
    description: section.description,
    path: `/features/${slug}`,
  });
}

export default async function FeatureCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getLandingSection(slug);
  if (!section) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: 'Features', path: '/features' },
          { name: section.title, path: `/features/${slug}` },
        ]}
      />
      <Header />
      <main>
        {/* Slim breadcrumb bar so a visitor who landed here from search can
            see where they are and step back up to the full feature index. */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-6xl px-6 pt-10 text-sm text-slate-500"
        >
          <a href="/features" className="font-medium text-brand-600 hover:text-brand-700">
            Features
          </a>
          <span className="px-2 text-slate-300">/</span>
          <span className="text-slate-700">{section.title}</span>
        </nav>
        <Section id={section.id} title={section.title} description={section.description}>
          <FeatureGrid items={section.items} />
        </Section>
        <StartDrawingCta />
      </main>
      <Footer />
    </>
  );
}
