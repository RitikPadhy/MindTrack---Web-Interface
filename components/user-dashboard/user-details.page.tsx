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
    { name: "Spiritual or religious tasks", value: 17 },
    { name: "Others", value: 13 },
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
    {
      week: "Week 1",
      daysUsed: 5,
      checkIns: 12,
      activitiesTracked: 8,
      selfCareTime: "2h 30m",
      othersHomeTime: "1h 45m",
      workEduTime: "6h 00m",
      leisureTime: "2h 15m",
      restSleepTime: "8h 00m",
      socialTime: "1h 30m",
      comments: "Consistent routine established."
    },
    {
      week: "Week 2",
      daysUsed: 4,
      checkIns: 10,
      activitiesTracked: 6,
      selfCareTime: "2h 00m",
      othersHomeTime: "2h 15m",
      workEduTime: "5h 30m",
      leisureTime: "1h 45m",
      restSleepTime: "7h 30m",
      socialTime: "2h 00m",
      comments: "Slight decrease in engagement."
    },
    {
      week: "Week 3",
      daysUsed: 6,
      checkIns: 15,
      activitiesTracked: 10,
      selfCareTime: "3h 00m",
      othersHomeTime: "1h 30m",
      workEduTime: "7h 00m",
      leisureTime: "2h 30m",
      restSleepTime: "8h 30m",
      socialTime: "1h 45m",
      comments: "Increased productivity and sleep quality."
    },
    {
      week: "Week 4",
      daysUsed: 3,
      checkIns: 8,
      activitiesTracked: 5,
      selfCareTime: "1h 30m",
      othersHomeTime: "2h 00m",
      workEduTime: "4h 00m",
      leisureTime: "1h 15m",
      restSleepTime: "7h 00m",
      socialTime: "1h 00m",
      comments: "Busy week, focused on recovery."
    },
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] flex justify-center items-center z-50">
      <Card className="w-[92vw] max-w-6xl h-[85vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            {user?.name || "Patient"} — Activity Overview
          </h2>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-8">
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