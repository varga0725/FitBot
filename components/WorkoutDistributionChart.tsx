import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { WorkoutLogEntry } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface WorkoutDistributionChartProps {
  logs: WorkoutLogEntry[];
  theme: string;
}

const WEEKDAYS = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];

const WorkoutDistributionChart: React.FC<WorkoutDistributionChartProps> = ({ logs, theme }) => {
  const data = React.useMemo(() => {
    const dayCounts = Array(7).fill(0);
    logs.forEach(log => {
      const dayIndex = new Date(log.date).getDay(); // 0 for Sunday, 1 for Monday, etc.
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust to Mon=0, Sun=6
      dayCounts[adjustedIndex]++;
    });

    const hexToRgba = (hex: string, alpha: number) => {
        if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            return `rgba(234, 88, 12, ${alpha})`;
        }
        let c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        const numeric = parseInt('0x' + c.join(''), 16);
        return `rgba(${(numeric >> 16) & 255}, ${(numeric >> 8) & 255}, ${numeric & 255}, ${alpha})`;
    };
    
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-500').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-500').trim();
    const lightGrayColor = '#d1d5db'; // gray-300
    
    const backgroundColors = [
        hexToRgba(primaryColor, 1),
        hexToRgba(primaryColor, 0.7),
        hexToRgba(secondaryColor, 1),
        hexToRgba(secondaryColor, 0.7),
        hexToRgba(lightGrayColor, 0.8),
        hexToRgba(lightGrayColor, 0.5),
        hexToRgba(primaryColor, 0.4)
    ];

    return {
      labels: WEEKDAYS,
      datasets: [
        {
          label: 'Edzések száma',
          data: dayCounts,
          backgroundColor: backgroundColors,
          borderColor: 'rgba(12, 10, 9, 0.5)',
          borderWidth: 2,
        },
      ],
    };
  }, [logs, theme]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
            color: '#d1d5db', // text-gray-300
            font: { family: 'Poppins, sans-serif' },
            boxWidth: 20,
        }
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
         borderColor: 'rgba(255, 255, 255, 0.1)',
         borderWidth: 1,
      }
    },
    cutout: '60%',
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-lg h-full flex flex-col">
       <h3 className="text-lg font-bold text-gray-100 mb-4 text-center">Edzések eloszlása a héten</h3>
       <div className="relative flex-grow h-64 min-h-[250px]">
         <Doughnut options={options} data={data} />
       </div>
    </div>
  );
};

export default WorkoutDistributionChart;