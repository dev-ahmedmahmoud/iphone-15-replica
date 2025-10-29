"use client";``

import { Navbar, Footer } from ".";

type LayoutClientProps = {
  children: React.ReactNode;
};

const LayoutClient: React.FC<LayoutClientProps> = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default LayoutClient;