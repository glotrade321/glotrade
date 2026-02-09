"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BarChart2 } from "lucide-react";
import { Locale, translate } from "@/utils/i18n";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
);

export default function StatusDoughnutChart({ data, locale }: { data: Record<string, number>, locale: Locale }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const entries = Object.entries(data || {});
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;

  const colors: Record<string, { bg: string; border: string }> = {
    pending: { bg: 'rgba(234, 179, 8, 0.8)', border: 'rgb(234, 179, 8)' },
    processing: { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },
    shipped: { bg: 'rgba(99, 102, 241, 0.8)', border: 'rgb(99, 102, 241)' },
    delivered: { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgb(16, 185, 129)' },
    cancelled: { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgb(239, 68, 68)' },
    disputed: { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgb(245, 158, 11)' },
  };

  const chartData = {
    labels: entries.map(([k]) => translate(locale, `orders.status.${k}`)),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([k]) => colors[k]?.bg || 'rgba(156, 163, 175, 0.8)'),
        borderColor: entries.map(([k]) => colors[k]?.border || 'rgb(156, 163, 175)'),
        borderWidth: 2,
        hoverOffset: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: isMobile ? 12 : 14
        },
        bodyFont: {
          size: isMobile ? 11 : 13
        },
        callbacks: {
          label: function (context: any) {
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    cutout: '65%',
  };

  if (entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{translate(locale, "orders.charts.noStatusData")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-48">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
      {/* Custom Legend */}
      <div className="mt-4 w-full grid grid-cols-2 gap-2">
        {entries.map(([k, v]) => {
          const percentage = ((v / total) * 100).toFixed(0);
          return (
            <div key={k} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: colors[k]?.bg || 'rgba(156, 163, 175, 0.8)' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize truncate">
                    {translate(locale, `orders.status.${k}`)}
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {v}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">
                  {percentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
