'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PDFPage } from '@/types/pdforg';
import { mergePDFPages, downloadPDF } from '@/lib/pdf-organize/merge';

interface AllPagesViewProps {
  pages: PDFPage[];
  onPagesChange: (pages: PDFPage[]) => void;
}

function SortablePageItem({ page, onRotate, onDelete }: {
  page: PDFPage;
  onRotate: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 bg-white rounded shadow-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Page Card */}
      <div className={`aspect-[3/4] bg-white border-2 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all ${isDragging ? 'border-blue-500 scale-105' : 'border-gray-200'}`}>
        <img
          src={page.thumbnail}
          alt={`${page.fileName} - Hal. ${page.pageNumber}`}
          className="w-full h-full object-contain transition-transform duration-200"
          style={{ transform: `rotate(${page.rotation}deg)` }}
        />
      </div>

      {/* Action Buttons */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onRotate}
          className="p-1 bg-white rounded shadow-md hover:bg-blue-50 border border-gray-200"
          title="Rotate 90°"
        >
          <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1 bg-white rounded shadow-md hover:bg-red-50 border border-gray-200"
          title="Hapus halaman"
        >
          <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Page Info */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-600 font-medium truncate" title={page.fileName}>
          {page.fileName}
        </p>
        <p className="text-xs text-gray-500">Hal. {page.pageNumber}</p>
        {page.rotation !== 0 && (
          <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
            ↻{page.rotation}°
          </span>
        )}
      </div>
    </div>
  );
}

export default function AllPagesView({ pages: initialPages, onPagesChange }: AllPagesViewProps) {
  const [pages, setPages] = useState<PDFPage[]>(initialPages);
  const [isMerging, setIsMerging] = useState(false);
  const [addPageNumbers, setAddPageNumbers] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);

      const newPages = arrayMove(pages, oldIndex, newIndex);
      setPages(newPages);
      onPagesChange(newPages);
    }
  };

  const rotatePage = (pageId: string) => {
    const newPages = pages.map((p) => {
      if (p.id === pageId) {
        const newRotation = ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...p, rotation: newRotation };
      }
      return p;
    });
    setPages(newPages);
    onPagesChange(newPages);
  };

  const deletePage = (pageId: string) => {
    const newPages = pages.filter((p) => p.id !== pageId);
    setPages(newPages);
    onPagesChange(newPages);
  };

  const handleMerge = async () => {
    if (pages.length === 0) {
      alert('Tidak ada halaman untuk digabungkan');
      return;
    }

    setIsMerging(true);

    try {
      const pdfBytes = await mergePDFPages(pages, { addPageNumbers });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      downloadPDF(pdfBytes, `merged-pdf-${timestamp}.pdf`);
      alert('✅ PDF berhasil digabungkan dan diunduh!');
    } catch (error) {
      console.error('Error merging PDF:', error);
      alert('❌ Gagal menggabungkan PDF. Silakan coba lagi.');
    } finally {
      setIsMerging(false);
    }
  };

  // Sync with parent changes
  if (initialPages.length !== pages.length) {
    setPages(initialPages);
  }

  return (
    <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Semua Halaman</h2>
          <p className="text-sm text-gray-600 mt-1">
            {pages.length} halaman siap digabungkan
          </p>
        </div>

        {/* Merge Button */}
        <button
          onClick={handleMerge}
          disabled={isMerging || pages.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          {isMerging ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Menggabungkan...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Gabung & Download PDF
            </>
          )}
        </button>
      </div>

      {/* Options */}
      <div className="mb-6 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={addPageNumbers}
            onChange={(e) => setAddPageNumbers(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span>Tambahkan nomor halaman</span>
        </label>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          💡 <strong>Tips:</strong> Drag & drop untuk mengatur ulang urutan halaman. 
          Klik rotate untuk memutar halaman 90°. Klik hapus untuk menghapus halaman.
        </p>
      </div>

      {/* Pages Grid with Drag & Drop */}
      {pages.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {pages.map((page) => (
                <SortablePageItem
                  key={page.id}
                  page={page}
                  onRotate={() => rotatePage(page.id)}
                  onDelete={() => deletePage(page.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Tidak ada halaman untuk ditampilkan</p>
          <p className="text-sm mt-1">Upload file dan expand untuk melihat halaman</p>
        </div>
      )}
    </div>
  );
}