'use client';

import { useRef, useEffect } from 'react';

/**
 * Wraps article content and applies alternating full-width section
 * backgrounds. After render, groups DOM children between <h2> boundaries
 * into section divs; alternate sections get a tinted band that spans the
 * full viewport width.
 */
export function SectionedContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const nodes = Array.from(container.childNodes);
    const sections: Node[][] = [[]];

    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'H2') {
        sections.push([node]);
      } else {
        sections[sections.length - 1]!.push(node);
      }
    }

    if (sections.length < 2) return;

    container.innerHTML = '';

    sections.forEach((sectionNodes, i) => {
      if (sectionNodes.length === 0) return;

      const wrapper = document.createElement('div');
      if (i === 0) {
        wrapper.className = 'article-intro';
      } else {
        wrapper.className = i % 2 === 0 ? 'article-section article-section-alt' : 'article-section';
      }

      for (const node of sectionNodes) {
        wrapper.appendChild(node);
      }

      container.appendChild(wrapper);
    });
  }, []);

  return (
    <div ref={ref} className="prose-help">
      {children}
    </div>
  );
}
