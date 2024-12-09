import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const TeamPerformance: React.FC = () => {
  const performanceData = [
    { name: 'Communication', teamAvg: 8.2, departmentAvg: 7.5 },
    { name: 'Teamwork', teamAvg: 7.8, departmentAvg: 7.2 },
    { name: 'Leadership', teamAvg: 7.5, departmentAvg: 6.9 },
    { name: 'Problem Solving', teamAvg: 8.0, departmentAvg: 7.3 },
    { name: 'Adaptability', teamAvg: 7.9, departmentAvg: 7.1 },
    { name: 'Time Management', teamAvg: 7.6, departmentAvg: 7.0 },
    { name: 'Creativity', teamAvg: 7.7, departmentAvg: 7.2 },
    { name: 'Technical Skills', teamAvg: 8.3, departmentAvg: 7.6 },
    { name: 'Initiative', teamAvg: 7.4, departmentAvg: 6.8 },
    { name: 'Professionalism', teamAvg: 8.5, departmentAvg: 7.8 },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Team Performance</h3>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar name="Team Average" dataKey="teamAvg" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Radar name="Department Average" dataKey="departmentAvg" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Performance Insights</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Your team excels in Technical Skills and Professionalism.</li>
          <li>There's room for improvement in Leadership and Initiative.</li>
          <li>The team consistently performs above the department average.</li>
        </ul>
      </div>
    </div>
  );
};

export default TeamPerformance;