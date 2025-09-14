import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { WorkoutLogEntry } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WorkoutFrequencyChartProps {
  logs: WorkoutLogEntry[];
  theme: string;
}

// Helper to get the start of a week (Monday)
const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  date.setHours(0, 0, 0, 0);
  return new Date(date.setDate(diff));
};

const WorkoutFrequencyChart: React.FC<WorkoutFrequencyChartProps> = ({ logs, theme }) => {
  const data = React.useMemo(() => {
    const weeklyCounts = [0, 0, 0, 0]; // This week, last week, 2 weeks ago, 3 weeks ago
    const today = new Date();
    const startOfThisWeek = getStartOfWeek(today);

    logs.forEach(log => {
      const logDate = new Date(log.date);
      const startOfLogWeek = getStartOfWeek(logDate);
      const diffTime = startOfThisWeek.getTime() - startOfLogWeek.getTime();
      const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));

      if (diffWeeks >= 0 && diffWeeks < 4) {
        weeklyCounts[diffWeeks]++;
      }
    });

    const hexToRgba = (hex: string, alpha: number) => {
        if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            return `rgba(234, 88, 12, ${alpha})`; // fallback to default orange
        }
        let c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        const numeric = parseInt('0x' + c.join(''), 16);
        return `rgba(${(numeric >> 16) & 255}, ${(numeric >> 8) & 255}, ${numeric & 255}, ${alpha})`;
    };

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-600').trim();
    const primaryColor400 = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-400').trim();

    return {
      labels: ['3 hete', '2 hete', 'Múlt hét', 'Ez a hét'],
      datasets: [
        {
          label: 'Elvégzett edzések',
          data: weeklyCounts.reverse(), // Reverse to match labels
          backgroundColor: hexToRgba(primaryColor, 0.6),
          borderColor: hexToRgba(primaryColor, 1),
          borderWidth: 1,
          borderRadius: 5,
          hoverBackgroundColor: hexToRgba(primaryColor400, 0.8),
        },
      ],
    };
  }, [logs, theme]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 10, 0.7)', // dark, semi-transparent
        backdropFilter: 'blur(4px)',
        titleFont: {
            family: 'Poppins, sans-serif',
            size: 14,
        },
        bodyFont: {
            family: 'Poppins, sans-serif',
            size: 12,
        },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#9ca3af', // text-gray-400
          stepSize: 1, // Only show whole numbers for workout counts
          font: { family: 'Poppins, sans-serif' }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af', // text-gray-400
          font: { family: 'Poppins, sans-serif' }
        },
      },
    },
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-lg">
       <h3 className="text-lg font-bold text-gray-100 mb-4">Heti Edzésintenzitás</h3>
       <div className="relative h-64">
         <Bar options={options as any} data={data} />
       </div>
    </div>
  );
};

export default WorkoutFrequencyChart;