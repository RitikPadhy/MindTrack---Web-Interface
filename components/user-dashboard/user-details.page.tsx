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

  // ✅ Pie Chart Data (Task Distribution)
  const taskData = [
    { name: "Eating", value: 40 },
    { name: "Playing", value: 20 },
    { name: "Reading", value: 25 },
    { name: "Sleeping", value: 15 },
  ];

  const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f87171"];

  // ✅ Custom label inside pie slices
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

  // ✅ Table Data (Week-wise overview)
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
          {/* --- Flex layout for Pie + Table side-by-side --- */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* --- Pie Chart Box --- */}
            <Card className="flex-1 p-4 shadow-md border border-gray-200">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-700 text-center">
                  Tasks Distribution
                </h3>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-80">
                <ResponsiveContainer width="90%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {taskData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="transition-transform duration-300 hover:scale-105"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#1e293b",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "13px",
                        color: "#334155",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* --- Table Box --- */}
            <Card className="flex-1 p-4 shadow-md border border-gray-200">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-700 text-center">
                  Weekly Activity Summary
                </h3>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="min-w-full text-sm border-collapse text-center">
                    <thead className="bg-gray-100 text-gray-700 font-medium">
                      <tr>
                        <th className="px-3 py-3 border-b">Week</th>
                        <th className="px-3 py-3 border-b">Total Time Spent</th>
                        <th className="px-3 py-3 border-b">Days Active</th>
                        <th className="px-3 py-3 border-b">
                          Varieties of Tasks Done
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekData.map((row, i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 even:bg-gray-50 transition"
                        >
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