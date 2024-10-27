import { ReactNode } from 'react';

export default function MarginWidthWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col md:ml-60 sm:border-r sm:border-l sm:border-zinc-200 min-h-screen">
      {children}
    </div>
  );
}