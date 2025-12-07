import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

function Loader() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  );
}

function Empty() {
  return (
    <div className="text-center py-16 text-gray-500">
      <p className="text-lg">No transactions found</p>
      <p className="text-sm">Try adjusting your filters</p>
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div className="text-center py-16 text-red-500">
      <p className="text-lg">Something went wrong</p>
      <p className="text-sm">{msg}</p>
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button onClick={handleCopy} className="ml-1 text-gray-400 hover:text-gray-600">
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

export function TransactionTable({ data, loading, error }) {
  if (loading) return <Loader />;
  if (error) return <ErrorMsg msg={error} />;
  if (data.length === 0) return <Empty />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer ID</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer name</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Category</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer region</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.transactionId} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-3 whitespace-nowrap">{row.transactionId}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{formatDate(row.date)}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.customerId}</td>
              <td className="px-3 py-3 whitespace-nowrap">{row.customerName}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                <span className="inline-flex items-center">
                  +91 {row.phone}
                  <CopyBtn text={row.phone} />
                </span>
              </td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.gender === 'Female' ? '♀' : '♂'} {row.gender}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.age}</td>
              <td className="px-3 py-3 font-medium whitespace-nowrap">{row.productCategory}</td>
              <td className="px-3 py-3 whitespace-nowrap">{String(row.quantity).padStart(2, '0')}</td>
              <td className="px-3 py-3 whitespace-nowrap">{formatCurrency(row.totalAmount)}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.customerRegion}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.productId}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.employeeName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
