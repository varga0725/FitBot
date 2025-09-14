import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ScriptableContext } from 'chart.js';
import type { WorkoutLogEntry } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WorkoutProgressChartProps {
  logs: WorkoutLogEntry[];
  theme: string;
}

const WorkoutProgressChart: React.FC<WorkoutProgressChartProps> = ({ logs, theme }) => {
  const data = React.useMemo(() => {
    if (logs.length === 0) {
      return { labels: [], datasets: [] };
    }

    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const labels = sortedLogs.map(log => new Date(log.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }));
    const cumulativeData = sortedLogs.map((_, index) => index + 1);

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-500').trim();

    return {
      labels,
      datasets: [
        {
          label: 'Összes edzés',
          data: cumulativeData,
          fill: true,
          borderColor: primaryColor,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: primaryColor,
          tension: 0.4,
          backgroundColor: (context: ScriptableContext<"line">) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              return null;
            }
            const primaryColorTransparent = getComputedStyle(document.documentElement).getPropertyValue('--glow-color').trim();
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(0,0,0,0)'); // transparent at the bottom
            gradient.addColorStop(1, primaryColorTransparent); // theme color at the top
            return gradient;
          },
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
        backgroundColor: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(4px)',
        titleFont: { family: 'Poppins, sans-serif', size: 14 },
        bodyFont: { family: 'Poppins, sans-serif', size: 12 },
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
          color: '#9ca3af',
          stepSize: 1,
          precision: 0,
          font: { family: 'Poppins, sans-serif' }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: { family: 'Poppins, sans-serif' },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7
        },
      },
    },
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-lg h-full flex flex-col">
       <h3 className="text-lg font-bold text-gray-100 mb-4 text-center">Edzések Számának Növekedése</h3>
       <div className="relative flex-grow h-64 min-h-[250px]">
         <Line options={options as any} data={data} />
       </div>
    </div>
  );
};

export default WorkoutProgressChart;
