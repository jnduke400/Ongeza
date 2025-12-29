
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loanPackagesData } from '../services/mockData';

const PackageCard: React.FC<{ data: typeof loanPackagesData[0] }> = ({ data }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-surface rounded-xl shadow-sm p-6 flex flex-col h-full border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-on-surface">{data.title}</h3>
        <p className="text-gray-500 text-sm mt-1">{data.subtitle}</p>
      </div>
      <div className="flex justify-around my-6 text-center">
        <div>
          <p className="text-4xl font-bold text-accent-blue">{data.interest}</p>
          <p className="text-sm text-gray-500 mt-1">{data.interestType}</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-on-surface">{data.amount}</p>
          <p className="text-sm text-gray-500 mt-1">Amount</p>
        </div>
      </div>
      <div className="border-t border-gray-200 my-4"></div>
      <div className="space-y-3 text-sm flex-grow">
        {data.details.map((detail, index) => (
          <div key={index} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2">
            <span className="text-gray-500">{detail.label}</span>
            <span className="text-gray-400 text-center">-</span>
            <span className="font-semibold text-gray-800 text-right">{detail.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <button onClick={() => navigate(`/loans/packages/${data.slug}`)} className="w-full bg-white text-accent-blue font-semibold py-2 px-4 rounded-lg border-2 border-accent-blue hover:bg-sky-100 transition-colors">
          Read More
        </button>
      </div>
    </div>
  );
};

const LoanPackagesPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-on-surface">Loan Package</h1>
        <p className="text-gray-500 mt-2">You have total 4 packages</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loanPackagesData.map((pkg) => (
          <PackageCard key={pkg.title} data={pkg} />
        ))}
      </div>
    </div>
  );
};

export default LoanPackagesPage;
