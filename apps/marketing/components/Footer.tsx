import { Brand } from '@livediagram/ui';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div>
          <Brand size="sm" />
          <p className="mt-1 text-sm text-slate-500">
            Diagrams and mindmaps for teams who think together.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <a href="/terms" className="hover:text-slate-900">
            Terms
          </a>
          <a href="/privacy" className="hover:text-slate-900">
            Privacy
          </a>
          <a href="mailto:hello@livediagram.app" className="hover:text-slate-900">
            Contact
          </a>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-6 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} livediagram. MIT licensed.</p>
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>
              Managing a team?{' '}
              <a
                href="https://manager-toolkit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-500 hover:text-brand-600"
              >
                Try Manager Toolkit
              </a>
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>
              Built by{' '}
              <a
                href="https://www.tommcclean.me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-500 hover:text-brand-600"
              >
                Tom McClean
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
