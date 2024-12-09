import React from 'react';
import { ClipboardList } from 'lucide-react';

const MyEvaluations: React.FC = () => {
  const evaluations = [
    { id: 1, name: 'Q1 Performance Review', status: 'Completed', score: 8.5 },
    { id: 2, name: 'Mid-Year Evaluation', status: 'In Progress', score: null },
    { id: 3, name: 'Project X Assessment', status: 'Pending', score: null },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">My Evaluations</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Evaluation Name</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((evaluation) => (
              <tr key={evaluation.id} className="border-b">
                <td className="px-4 py-2">{evaluation.name}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    evaluation.status === 'Completed' ? 'bg-green-200 text-green-800' :
                    evaluation.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {evaluation.status}
                  </span>
                </td>
                <td className="px-4 py-2">{evaluation.score !== null ? evaluation.score.toFixed(1) : '-'}</td>
                <td className="px-4 py-2">
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <ClipboardList size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyEvaluations;