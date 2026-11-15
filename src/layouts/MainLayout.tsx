import type { ReactNode } from 'react';
import './main-layout.css';

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      <main className="main-layout__content">{children}</main>
    </div>
  );
}
