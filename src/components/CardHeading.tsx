import type { ReactNode } from 'react';

export function CardHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}
