import PdfUploadSection from '@/components/features/PdfUploadSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Organizer - Kelola Dokumen PDF Anda',
  description: 'Aplikasi web untuk mengelola, menggabungkan, dan mengatur dokumen PDF dengan mudah',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-12 px-4">
        <PdfUploadSection />
    </main>
  );
}