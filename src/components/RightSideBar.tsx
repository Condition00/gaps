"use client"; // Add this line at the top of the file

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TaskProgress {
  title: string;
  progress: number;
}

const tasks: TaskProgress[] = [
  { title: "Task 1", progress: 40 },
  { title: "Task 2", progress: 75 },
  { title: "Task 3", progress: 30 },
];

const CircularProgressBar = ({
  progress,
  size,
  strokeW
}: {
  progress: number;
  strokeW: number
  size: number;
}) => {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeW}
        className="text-gray-300"
        fill="none"
        stroke="currentColor"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeW}
        className="text-[#fc7b7b] transition-all duration-300"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.3em"
        className="text-black font-semibold"
        style={{ fontSize: size / 5 }}
      >
        {progress}%
      </text>
    </svg>
  );
};

// Line Chart Component with Area Fill for Monthly Task Completion
const TaskCompletionChart: React.FC = () => {
  const chartData = {
    labels: Array.from({ length: 30 }, () => ""), // Blank labels for each day
    datasets: [
      {
        label: '% Tasks Completed',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 101)), // Random completion data for each day
        backgroundColor: 'rgba(252, 123, 123, 0.2)', // Area fill color
        borderColor: '#fc7b7b', // Line color
        borderWidth: 2,
        fill: true,
        tension: 0.4, // Smooth line
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        type: 'category',
        grid: { display: false },
        title: { display: true, text: 'Days' },
        ticks: {
          padding: -10,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          beginAtZero: true,
          max: 100
        },
        grid: { display: false },
        title: { display: true, text: 'Completion (%)' },
      },
    },
  } as ChartOptions<'line'>;

  return (
    <div className="mt-20 w-full h-80"> {/* Adjusted for larger size */}
      <h4 className="text-xl font-semibold mb-2 text-center">Over the Month</h4>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

const RightSidebar: React.FC = () => {
  const overallProgress = 65;

  return (
    <div className="sticky top-5 w-96 h-[calc(100vh-5rem)] bg-white text-black p-6 rounded-lg z-10 flex flex-col justify-between shadow-sm">
      <div>
        <h3 className="text-4xl font-semibold mb-8 mt-8 text-center">Dashboard</h3>

        {/* Large Circle */}
        <div className="flex flex-col items-center mb-8">
          <CircularProgressBar progress={overallProgress} strokeW={10} size={100} />
          <span className="mt-4 text-lg font-semibold">6Hrs 32mins</span>
        </div>

        {/* Smaller Circles */}
        <div className="flex justify-around items-center mb-8">
          {tasks.map((task, index) => (
            <div key={index} className="flex flex-col items-center">
              <CircularProgressBar progress={task.progress} strokeW={7} size={50} />
              <span className="mt-2 text-sm">{task.title}</span>
            </div>
          ))}
        </div>

        {/* Line Chart for Monthly Task Completion */}
        <TaskCompletionChart />
      </div>
    </div>
  );
};

export default RightSidebar;
