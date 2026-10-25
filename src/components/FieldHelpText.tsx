import type { ReactNode } from 'react';

export function FieldHelpText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1 text-sm text-gray-700">
      {children}
    </p>
  );
}
