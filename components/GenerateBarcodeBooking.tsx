"use client";
import { ArrowLeft, ArrowRight, Printer, RefreshCw } from "lucide-react";
import { useState } from "react"

const socket = new WebSocket("ws://localhost:6025");
    socket.onopen = () => console.log("WebSocket connected");
    socket.onerror = (e) => console.error("WebSocket error", e);
    socket.onmessage = (msg) => console.log("Printer reply", msg.data);  

export default function GenerateBarcodeBooking(){
    const [strkeu, setStrkeu] = useState<string[][]>([]);
    const [printIndex, setPrintIndex] = useState<number>(0);

    const strToCleanData = (strkeu: string): string[][] => {
        let cleanData: string[][] = [];
        const regex =
          /([A-Za-z]+(\s+[A-Za-z]+)+)\t([0-9]+(-[0-9]+)+)\t([A-Za-z0-9]+(-[A-Za-z0-9]+)+)\t/;
        const arr = strkeu.split(regex);
    
        let currentArray = [...arr];
        const dataLengthPerCheck = 7;
        const indices = [1, 3, 5];
        while (currentArray.length >= dataLengthPerCheck) {
          const newData: string[] = [];
          for (const index of indices) {
            newData.push(currentArray[index]);
          }
          cleanData.push(newData);
          currentArray = currentArray.slice(dataLengthPerCheck);
        }
        return cleanData;
      };


      const generateZPL = (nama : string, kdbooking: string) => {
        return `
            ^XA
            ^PW460
            ^LL240
            ^FO20,40^A0N,30,30^FD${nama}^FS
            ^FO20,80^BY2
            ^BCN,110,Y,N,N
            ^FD${kdbooking}^FS
            ^XZ
            `;
      }
      
      const handlePrint = () => {
        try{
            const getRaw = strkeu[printIndex - 1];
            const dataPrint = generateZPL(getRaw[0],getRaw[2])
            sendPrint(dataPrint);
        } catch {
            alert("Data habis atau ada Erorr, lakukan Reload")
        }
      }

      const sendPrint = (zplData:string) => {
        if (socket.readyState === WebSocket.OPEN) {
            const data = {
              printer: "zebra",
              type: "zpl",
              data: zplData,
            };
            socket.send(JSON.stringify(data));
          } else {
            alert("Printer belum terhubung");
          }
      }
      const reload = () => {
        setStrkeu([])
        setPrintIndex(0)
      }
      
    return(
        <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Generate Barcode Booking</h1>
                <p className="text-gray-600">
                    Paste a string below !
                </p>
            </div>
            <div className="">
                <div className="flex justify-end">
                    <button className="px-2 py-3 text-white bg-rose-600 rounded-lg flex items-center justify-center mb-4" onClick={ () => reload() }><RefreshCw className="w-6 h-6 mr-2"/>Reload</button>
                </div>
                {strkeu.length == 0 && (
                    <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                        String From KEU30 :
                    </label>
                    <textarea
                        placeholder="Paste disini..."
                        rows={4}
                        onChange={(e) => {
                             const cleans = strToCleanData(e.target.value);
                             setStrkeu(cleans);
                            
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                    />
                    </div>
                )}
                {strkeu.length > 0 && (
                    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                    <th className="px-2 py-1 text-left text-white font-semibold">
                                        No.
                                    </th>
                                    <th className="px-2 py-1 text-left text-white font-semibold">
                                        Nama
                                    </th>
                                    <th className="px-2 py-1 text-left text-white font-semibold">
                                        Tanggal
                                    </th>
                                    <th className="px-2 py-1 text-left text-white font-semibold">
                                        Kd Booking
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {strkeu.map((row, index) => (
                                    <tr 
                                        key={index} 
                                        className={[
                                            index == printIndex - 1 ? 'bg-red-500' : ''
                                          ].join(' ')}
                                    >
                                        <td className="px-2 py-1 border-t border-gray-200">
                                            {index+1}.
                                        </td>
                                        <td className="px-2 py-1 border-t border-gray-200">
                                            {row[0]}
                                        </td>
                                        <td className="px-2 py-1 border-t border-gray-200">
                                            {row[1]}
                                        </td>
                                        <td className="px-2 py-1 border-t border-gray-200">
                                            {row[2]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Buttons - Tampil hanya jika ada data */}
                {strkeu.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                        className="px-5 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        onClick={() => setPrintIndex(prev => prev - 1)}
                        >
                            <ArrowLeft />
                        </button>
                        <button 
                        className="px-5 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        onClick={() => setPrintIndex(prev => prev + 1)}
                        >
                            <ArrowRight />
                        </button>
                        <button 
                        className="px-5 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        onClick={() => {
                            handlePrint()
                        }}
                        >
                            <Printer />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}