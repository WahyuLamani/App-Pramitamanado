export default function BookingTableSkeleton() {
    return (
      <div className="bg-white rounded-lg shadow animate-pulse">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
  
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Skeleton Rows */}
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {/* Tanggal & Jam */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-36"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </td>
                  
                  {/* Pasien */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-28"></div>
                    </div>
                  </td>
                  
                  {/* Pemeriksaan */}
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                  </td>
                  
                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded-full w-28"></div>
                  </td>
                  
                  {/* Petugas */}
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  
                  {/* Keterangan */}
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  
                  {/* Aksi */}
                  <td className="px-6 py-4">
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }