"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiBase } from "@/lib/apiBase";

type Task = {
  raw: string;   // EXACT user input
  time: string;
};

export default function UpdateUserDialog({
  open,
  onOpenChange,
  patientIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientIds: string[];
}) {
  const [formData, setFormData] = useState<{
    uid: string;
    tasks: Task[];
  }>({
    uid: "",
    tasks: Array.from({ length: 17 }, () => ({
      raw: "",
      time: "",
    })),
  });

  const handleChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedTasks = [...prev.tasks];
      updatedTasks[index] = {
        ...updatedTasks[index],
        raw: value, // store EXACT text
      };
      return { ...prev, tasks: updatedTasks };
    });
  };

  const splitTasks = (value: string): string[] =>
    value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSubmit = async () => {
    try {
      const baseUrl = getApiBase();

      const tasksPayload = formData.tasks.reduce(
        (acc, task, idx) => {
          const titles = splitTasks(task.raw);
          if (titles.length > 0) {
            acc[idx] = {
              titles,
              time: task.time,
            };
          }
          return acc;
        },
        {} as Record<number, { titles: string[]; time: string }>
      );

      const res = await fetch(`${baseUrl}/users/update-tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: formData.uid,
          tasks: tasksPayload,
        }),
      });

      if (!res.ok) throw new Error("Failed to update user tasks");

      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-[3px] flex justify-center items-center z-50"
      role="dialog"
    >
      <Card className="w-full max-w-3xl bg-white rounded-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-[28px] font-bold text-gray-900">
            Update User Tasks
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 max-h-[65vh] overflow-y-auto px-8 pb-4">
          {/* User ID */}
          <div className="flex flex-col space-y-2">
            <Label>User ID</Label>
            {patientIds.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No patient IDs available.
              </p>
            ) : (
              <select
                value={formData.uid}
                onChange={(e) =>
                  setFormData({ ...formData, uid: e.target.value })
                }
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

          {/* Task Slot 1 */}
          <div className="flex flex-col space-y-2">
            <Label>Task Slot 1 (6AM-7AM)</Label>
            <Input
              value={formData.tasks[0].raw}
              onChange={(e) => handleChange(0, e.target.value)}
              placeholder="Eating and Drinking, Playing"
              className="text-sm text-gray-700"
            />
          </div>

          {/* Remaining task slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.tasks.slice(1).map((task, idx) => (
              <div key={idx + 1} className="flex flex-col space-y-2">
                <Label>
                  Task Slot {idx + 2} (
                  {
                    [
                      "7AM-8AM",
                      "8AM-9AM",
                      "9AM-10AM",
                      "10AM-11AM",
                      "11AM-12PM",
                      "12PM-1PM",
                      "1PM-2PM",
                      "2PM-3PM",
                      "3PM-4PM",
                      "4PM-5PM",
                      "5PM-6PM",
                      "6PM-7PM",
                      "7PM-8PM",
                      "8PM-9PM",
                      "9PM-10PM",
                      "10PM-11PM",
                    ][idx]
                  }
                  )
                </Label>
                <Input
                  value={task.raw}
                  onChange={(e) => handleChange(idx + 1, e.target.value)}
                  placeholder="Enter tasks"
                  className="text-sm text-gray-700"
                />
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 px-8 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white"
          >
            Update
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}