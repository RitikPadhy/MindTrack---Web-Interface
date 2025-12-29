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

const CATEGORIES = [
  "Care of Self",
  "Care of others/Home",
  "Work or Education",
  "Leisure",
  "Rest or Sleep",
  "Social participation",
];

type TaskItem = {
  category: string;
  title: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientIds: string[];
};

export default function UpdateUserDialog({
  open,
  onOpenChange,
  patientIds,
}: Props) {
  const [uid, setUid] = useState("");
  const [tasks, setTasks] = useState<TaskItem[][]>(
    Array.from({ length: 17 }, () => [{ category: "", title: "" }])
  );

  const updateTask = (
    slotIndex: number,
    taskIndex: number,
    field: "category" | "title",
    value: string
  ) => {
    setTasks((prev) => {
      const copy = [...prev];
      copy[slotIndex] = [...copy[slotIndex]];
      copy[slotIndex][taskIndex] = {
        ...copy[slotIndex][taskIndex],
        [field]: value,
      };
      return copy;
    });
  };

  const addTaskRow = (slotIndex: number) => {
    setTasks((prev) => {
      if (prev[slotIndex].length >= 2) return prev;
      const copy = [...prev];
      copy[slotIndex] = [
        ...copy[slotIndex],
        { category: "", title: "" },
      ];
      return copy;
    });
  };

  const removeTaskRow = (slotIndex: number) => {
    setTasks((prev) => {
      const copy = [...prev];
      copy[slotIndex] = [copy[slotIndex][0]]; // keep only first task
      return copy;
    });
  };

  const handleSubmit = async () => {
    try {
      const payload: Record<number, TaskItem[]> = {};

      tasks.forEach((slot, idx) => {
        const cleaned = slot.filter(
          (t) => t.title.trim() && t.category
        );
        if (cleaned.length) {
          payload[idx] = cleaned;
        }
      });

      const res = await fetch(`${getApiBase()}/users/update-tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          tasks: payload,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update tasks");
      }

      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Update User Tasks</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 max-h-[65vh] overflow-y-auto">
          {/* User ID */}
          <div className="space-y-2">
            <Label>User ID</Label>
            <select
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Select User</option>
              {patientIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          {/* Task Slots */}
          {tasks.map((slot, slotIdx) => (
            <div
              key={slotIdx}
              className="border rounded-lg p-3 space-y-2"
            >
              <Label>Task Slot {slotIdx + 1}</Label>

              {slot.map((task, taskIdx) => (
                <div key={taskIdx} className="flex gap-2 items-center">
                  <select
                    value={task.category}
                    onChange={(e) =>
                      updateTask(
                        slotIdx,
                        taskIdx,
                        "category",
                        e.target.value
                      )
                    }
                    className="border rounded px-2 py-1 w-1/3"
                  >
                    <option value="">Choose category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <Input
                    value={task.title}
                    onChange={(e) =>
                      updateTask(
                        slotIdx,
                        taskIdx,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Enter task"
                  />

                  {/* + Button */}
                  {taskIdx === 0 && slot.length === 1 && (
                    <Button
                      variant="outline"
                      onClick={() => addTaskRow(slotIdx)}
                    >
                      +
                    </Button>
                  )}

                  {/* − Button */}
                  {taskIdx === 1 && (
                    <Button
                      variant="outline"
                      onClick={() => removeTaskRow(slotIdx)}
                    >
                      −
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update</Button>
        </CardFooter>
      </Card>
    </div>
  );
}