import React, { useState } from 'react';
import { User } from 'lucide-react';

const virtues = [
  'Communication', 'Teamwork', 'Leadership', 'Problem Solving',
  'Adaptability', 'Time Management', 'Creativity', 'Technical Skills',
  'Initiative', 'Professionalism'
];

const StartEvaluation: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  const handleRatingChange = (virtue: string, value: number) => {
    setRatings(prev => ({ ...prev, [virtue]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted ratings:', ratings);
    // Here you would typically send the data to your backend
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Start New Evaluation</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-2">
            Select Employee
          </label>
          <select
            id="employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select an employee</option>
            <option value="1">John Doe</option>
            <option value="2">Jane Smith</option>
            <option value="3">Mike Johnson</option>
          </select>
        </div>
        <div className="space-y-4">
          {virtues.map((virtue) => (
            <div key={virtue} className="flex items-center justify-between">
              <label htmlFor={virtue} className="text-sm font-medium text-gray-700">
                {virtue}
              </label>
              <select
                id={virtue}
                value={ratings[virtue] || ''}
                onChange={(e) => handleRatingChange(virtue, parseInt(e.target.value))}
                className="ml-4 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a rating</option>
                {[...Array(11)].map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="mt-6 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300"
        >
          Submit Evaluation
        </button>
      </form>
    </div>
  );
};

export default StartEvaluation;