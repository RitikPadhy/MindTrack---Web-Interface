"use client";

import { useEffect, useState } from "react";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface CategoryMetric {
  name: string;
  value: number;
}

export interface WeekMetric {
  week: string;
  daysUsed: number;
  checkIns: number;
  activitiesTracked: number;
  selfCareTime: string;
  othersHomeTime: string;
  workEduTime: string;
  leisureTime: string;
  restSleepTime: string;
  socialTime: string;
  comments: string;
}

export default function UserDetailsPage({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}) {
  const [loading, setLoading] = useState(false);

  const [metrics, setMetrics] = useState<{
    categoryData: CategoryMetric[];
    weekData: WeekMetric[];
  } | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${user?.uid}/details`);
        if (res.ok) {
          const data = (await res.json()) as {
            categoryData: CategoryMetric[];
            weekData: WeekMetric[];
          };
          setMetrics(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (open && user?.uid) {
      fetchDetails();
    }
  }, [open, user]);

  if (!open) return null;

  /* -------------------------------------------------------
     ✅ Data from API (or defaults)
  ------------------------------------------------------- */
  const categoryData = metrics?.categoryData || [];
  const weekData = metrics?.weekData || [];

  const COLORS = [
    "#4ade80", // green
    "#60a5fa", // blue
    "#facc15", // yellow
    "#fb7185", // pink
    "#a78bfa", // purple
    "#38bdf8", // sky
    "#94a3b8", // slate for "Other"
  ];

  /* -------------------------------------------------------
     ✅ Custom pie label
  ------------------------------------------------------- */
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent === 0) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#1e293b"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12px"
        fontWeight="500"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] flex justify-center items-center z-50">
      <Card className="w-[92vw] max-w-6xl h-[85vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            {user?.name || "Patient"} — Activity Overview
          </h2>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Fetching activity data...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* ---------------- Pie Chart ---------------- */}
              <Card className="flex-1 p-4 shadow-md border border-gray-200">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-700 text-center">
                    Activity Category Distribution
                  </h3>
                </CardHeader>

                <CardContent className="flex justify-center items-center h-80">
                  {categoryData.length > 0 && categoryData.some(d => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={3}
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomizedLabel}
                        >
                          {categoryData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip />
                        <Legend
                          verticalAlign="bottom"
                          height={48}
                          iconType="circle"
                          wrapperStyle={{ fontSize: "13px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-gray-400 italic">No activity data recorded yet.</div>
                  )}
                </CardContent>
              </Card>

              {/* ---------------- Weekly Table ---------------- */}
              <Card className="flex-1 p-4 shadow-md border border-gray-200">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-700 text-center">
                    Weekly Activity Summary
                  </h3>
                </CardHeader>

                <CardContent>
                  {weekData.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full text-sm text-center">
                        <thead className="bg-gray-100 text-gray-700 whitespace-nowrap">
                          <tr>
                            <th className="px-3 py-3 border-b sticky left-0 bg-gray-100 z-10">Week</th>
                            <th className="px-3 py-3 border-b">Days Used</th>
                            <th className="px-3 py-3 border-b">Check-ins</th>
                            <th className="px-3 py-3 border-b">Activities Tracked</th>
                            <th className="px-3 py-3 border-b">Self Care</th>
                            <th className="px-3 py-3 border-b">Home / Others</th>
                            <th className="px-3 py-3 border-b">Work / Edu</th>
                            <th className="px-3 py-3 border-b">Leisure</th>
                            <th className="px-3 py-3 border-b">Rest & Sleep</th>
                            <th className="px-3 py-3 border-b">Social</th>
                            <th className="px-3 py-3 border-b">Comments</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weekData.map((row, i) => (
                            <tr key={i} className="even:bg-gray-50 whitespace-nowrap">
                              <td className="px-3 py-2 border-b font-medium sticky left-0 bg-inherit z-10">{row.week}</td>
                              <td className="px-3 py-2 border-b">{row.daysUsed}</td>
                              <td className="px-3 py-2 border-b">{row.checkIns}</td>
                              <td className="px-3 py-2 border-b">{row.activitiesTracked}</td>
                              <td className="px-3 py-2 border-b">{row.selfCareTime}</td>
                              <td className="px-3 py-2 border-b">{row.othersHomeTime}</td>
                              <td className="px-3 py-2 border-b">{row.workEduTime}</td>
                              <td className="px-3 py-2 border-b">{row.leisureTime}</td>
                              <td className="px-3 py-2 border-b">{row.restSleepTime}</td>
                              <td className="px-3 py-2 border-b">{row.socialTime}</td>
                              <td className="px-3 py-2 border-b text-left max-w-xs truncate">{row.comments}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 italic">No weekly summary available.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-40 py-2 text-base font-medium cursor-pointer"
          >
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}