import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronRight, ChevronLeft, Printer, Receipt, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/transactions?query=${searchQuery}&page=${currentPage}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery === '') {
      fetchTransactions();
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchTransactions();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, currentPage]);

  const generateReceipt = (transaction) => {
    try {
      const doc = new jsPDF();

      // 1. Clinic Header
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text("DENTAL CLINIC INC.", 105, 22, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text("123 Clinic Address, Cebu City, Philippines", 105, 28, { align: "center" });
      doc.text("Phone: +63 912 345 6789 | Email: billing@dentalclinic.com", 105, 33, { align: "center" });

      // Divider Line
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);

      // 2. Receipt Title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("OFFICIAL RECEIPT", 105, 48, { align: "center" });

      // 3. Transaction & Patient Details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      
      // Left side (Transaction info)
      doc.text(`Receipt No: TXN-${String(transaction.id).padStart(5, '0')}`, 14, 58);
      doc.text(`Date: ${new Date(transaction.transaction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 63);

      // Right side (Patient info)
      doc.text(`Patient Name: ${transaction.first_name} ${transaction.last_name}`, 120, 58);
      doc.text(`Patient ID: ${transaction.unique_id}`, 120, 63);

      // 4. The Itemized Table
      doc.autoTable({
        startY: 72,
        head: [['Procedure / Description', 'Qty', 'Amount (PHP)']],
        body: [
          [transaction.procedure_name.toUpperCase(), '1', Number(transaction.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })]
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' }, 
        bodyStyles: { textColor: [15, 23, 42], fontSize: 10, cellPadding: 5 },
        columnStyles: {
          0: { cellWidth: 'auto', fontStyle: 'bold' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
        }
      });

      // 5. Total Computation
      const finalY = doc.lastAutoTable.finalY || 72;
      
      // Total Box Background
      doc.setFillColor(248, 250, 252);
      doc.rect(120, finalY + 5, 76, 12, 'F');
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("TOTAL PAID:", 125, finalY + 13);
      doc.text(`PHP ${Number(transaction.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 191, finalY + 13, { align: "right" });

      // 6. Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("Thank you for trusting us with your smile!", 105, finalY + 35, { align: "center" });
      doc.text("This is a system-generated official receipt and does not require a signature.", 105, finalY + 40, { align: "center" });

      // 7. Save and Download
      doc.save(`Receipt_TXN-${transaction.id}_${transaction.last_name}.pdf`);
      
    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate receipt.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Receipt className="text-blue-600" size={24} />
            Billing & Transactions
          </h2>
          <p className="text-gray-500 mt-1 text-xs uppercase tracking-wider font-semibold">Generate receipts and view payment history.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={14} />
          </div>
          <input 
            type="text" 
            placeholder="Search by Patient Name or TXN ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm shadow-sm font-semibold"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
        <div className="overflow-x-auto flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
              <Activity className="animate-pulse text-blue-600" size={28} />
            </div>
          )}
          <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
            <thead className="bg-slate-800 text-white uppercase text-[10px] font-semibold tracking-wider sticky top-0 z-10 border-b border-slate-900">
              <tr>
                <th className="px-4 py-3">TXN ID</th>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3">Procedure</th>
                <th className="px-4 py-3">Amount Paid</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-blue-50 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-500 uppercase tracking-wider">
                      TXN-{String(txn.id).padStart(5, '0')}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900 uppercase">
                      {txn.first_name} {txn.last_name}
                    </td>
                    <td className="px-4 py-3 text-[10px] font-bold text-blue-700 bg-blue-50/50 uppercase tracking-wider">
                      {txn.procedure_name}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-600">
                      PHP {Number(txn.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {new Date(txn.transaction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button 
                        onClick={() => generateReceipt(txn)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                      >
                        <Printer size={12} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    {!isLoading && 'No transactions found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}