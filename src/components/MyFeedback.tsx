import React from 'react';
import { MessageSquare } from 'lucide-react';

const MyFeedback: React.FC = () => {
  const feedbacks = [
    { id: 1, from: 'Alice Johnson', date: '2023-03-15', summary: 'Great leadership skills' },
    { id: 2, from: 'Bob Smith', date: '2023-03-10', summary: 'Excellent problem-solving abilities' },
    { id: 3, from: 'Carol Williams', date: '2023-03-05', summary: 'Strong communication skills' },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">My Feedback</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">{feedback.from}</span>
              <span className="text-sm text-gray-500">{feedback.date}</span>
            </div>
            <p className="text-gray-600">{feedback.summary}</p>
            <button className="mt-2 text-indigo-600 hover:text-indigo-800 flex items-center">
              <MessageSquare size={16} className="mr-1" />
              <span>Read Full Feedback</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyFeedback;