"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiBase } from "@/lib/apiBase";

export default function UpdateUserDialog({
  open,
  onOpenChange,
  patientIds
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientIds: string[];
}) {
  const [formData, setFormData] = useState({
    uid: "",
    tasks: Array.from({ length: 17 }, () => ({ titles: [] as string[], time: "" })),
  });


  const splitTasks = (value: string) => {
    return value.split(",").map((t) => t.trim());
  };

  const handleChange = (index: number, value: string) => {
    try {
      const updatedTasks = [...formData.tasks];
      updatedTasks[index] = { ...updatedTasks[index], titles: splitTasks(value) };
      setFormData((prev: typeof formData) => ({ ...prev, tasks: updatedTasks }));
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  const handleSubmit = async () => {
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/users/update-activity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: formData.uid,
          tasks: formData.tasks.reduce((acc: Record<number, { titles: string[], time: string }>, task, idx) => {
            const splitTitles = task.titles.flatMap(title => splitTasks(title));
            acc[idx] = { titles: splitTitles, time: task.time };
            if (splitTitles.length > 0) acc[idx] = { titles: splitTitles, time: task.time };
            return acc;
          }, {} as Record<number, { titles: string[], time: string }>),
        }),
      });

      if (!res.ok) throw new Error("Failed to update user tasks");

      onOpenChange(false);
      window.location.reload(); // Refresh to show updated data
    } catch (err) {
      console.error("Error updating user:", err);
    }

  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] flex justify-center items-center z-50" role="dialog">
      <Card className="w-full max-w-3xl bg-white rounded-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-[28px] font-bold text-gray-900 dark:text-white">
            Update User Tasks
          </CardTitle>
        </CardHeader>

        {/* ✅ Increased horizontal padding (px-8) for left/right spacing */}
        <CardContent className="space-y-6 max-h-[65vh] overflow-y-auto px-8 pb-4">
          {/* User ID and Task 1 side by side */}
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 w-full">
                <Label>User ID</Label>
                {patientIds.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No patient IDs available.</p>
                ) : (
                <select
                    value={formData.uid}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, uid: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 w-full"
                >
                    <option value="">Select a User ID</option>
                    {patientIds.map((uid) => (
                    <option key={uid} value={uid}>
                        {uid}
                    </option>
                    ))}
                </select>
                )}
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <Label>Task Slot 1</Label>
              <Input
                value={formData.tasks[0].titles.join(", ")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(0, e.target.value)}
                placeholder="Enter tasks separated by commas, e.g., Task1, Task2"
                title="You can enter multiple tasks separated by commas"
                className="text-sm text-gray-700"
              />
            </div>
          </div>

          {/* Remaining tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.tasks.slice(1).map((task: { titles: string[] }, idx: number) => (
              <div key={idx + 1} className="flex flex-col space-y-2">
                <Label>Task Slot {idx + 2}</Label>
                <div className="flex space-x-2">
                  <Input
                  value={task.titles.join(", ")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx + 1, e.target.value)}
                  placeholder="Enter comma-separated task titles"
                  className="text-sm text-gray-700"
                />
                <Input
                  value={task.time}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const updatedTasks = [...formData.tasks];
                    updatedTasks[idx + 1].time = e.target.value;
                    setFormData((prev: typeof formData) => ({ ...prev, tasks: updatedTasks }));
                  }}
                  placeholder="e.g., 10AM-11AM"
                  className="text-sm text-gray-700 w-32"
                />
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 px-8 pb-6">
          <Button
            variant="outline"
            className="cursor-pointer text-gray-700 hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white"
            onClick={handleSubmit}
          >
            Update
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}