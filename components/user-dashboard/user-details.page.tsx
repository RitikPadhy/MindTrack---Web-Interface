"use client";

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

export default function UserDetailsPage({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}) {
  if (!open) return null;

  /* -------------------------------------------------------
     ✅ STATIC CATEGORY DISTRIBUTION (ALL 6)
  ------------------------------------------------------- */
  const categoryData = [
    { name: "Care of Self", value: 20 },
    { name: "Care of Others / Home", value: 18 },
    { name: "Work or Education", value: 22 },
    { name: "Leisure", value: 15 },
    { name: "Rest or Sleep", value: 15 },
    { name: "Social Participation", value: 10 },
  ];

  const COLORS = [
    "#4ade80", // green
    "#60a5fa", // blue
    "#facc15", // yellow
    "#fb7185", // pink
    "#a78bfa", // purple
    "#38bdf8", // sky
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
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

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

  /* -------------------------------------------------------
     ✅ Static weekly summary
  ------------------------------------------------------- */
  const weekData = [
    { week: "Week 1", timeSpent: "12 hrs", daysActive: 5, tasksDone: 4 },
    { week: "Week 2", timeSpent: "10 hrs", daysActive: 4, tasksDone: 3 },
    { week: "Week 3", timeSpent: "15 hrs", daysActive: 6, tasksDone: 5 },
    { week: "Week 4", timeSpent: "9 hrs", daysActive: 3, tasksDone: 3 },
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] flex justify-center items-center z-50">
      <Card className="w-full max-w-5xl bg-white rounded-xl shadow-xl">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            {user?.name || "Patient"} — Activity Overview
          </h2>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ---------------- Pie Chart ---------------- */}
            <Card className="flex-1 p-4 shadow-md border border-gray-200">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-700 text-center">
                  Activity Category Distribution
                </h3>
              </CardHeader>

              <CardContent className="flex justify-center items-center h-80">
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
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full text-sm text-center">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-3 py-3 border-b">Week</th>
                        <th className="px-3 py-3 border-b">Time Spent</th>
                        <th className="px-3 py-3 border-b">Days Active</th>
                        <th className="px-3 py-3 border-b">
                          Task Varieties
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekData.map((row, i) => (
                        <tr key={i} className="even:bg-gray-50">
                          <td className="px-3 py-2 border-b">{row.week}</td>
                          <td className="px-3 py-2 border-b">{row.timeSpent}</td>
                          <td className="px-3 py-2 border-b">{row.daysActive}</td>
                          <td className="px-3 py-2 border-b">{row.tasksDone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
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