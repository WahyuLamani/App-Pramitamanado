import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Merge Img & PDF",
  description: "Merge image and pdf",
};

export default function MergeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        {children}
    </>
  );
}
