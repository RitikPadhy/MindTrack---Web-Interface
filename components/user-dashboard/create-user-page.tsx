"use client";

import { useState } from "react";
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

export default function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    uid: "",
    password: "",
    name: "",
    gender: "",
    role: "Patient",
    diagnosis: "",
    age: "",
    startDate: "",
    weekNo: "",
    status: "Active",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      const baseUrl = getApiBase();

      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : null,
        weekNo: formData.weekNo ? Number(formData.weekNo) : undefined,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : undefined,
      };

      const res = await fetch(`${baseUrl}/users/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.detail || "Failed to create user");
      }

      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Failed to create user. Check console for details.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] flex justify-center items-center z-50">
      <Card className="w-full max-w-2xl bg-white rounded-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-[28px] font-bold text-gray-900">
            Create New User
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User ID */}
          <div className="flex flex-col space-y-2">
            <Label>User ID</Label>
            <Input
              value={formData.uid}
              onChange={(e) => handleChange("uid", e.target.value)}
              placeholder="Enter user ID"
            />
          </div>

          {/* Name */}
          <div className="flex flex-col space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter name"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                handleChange("password", e.target.value)
              }
              placeholder="Set password"
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col space-y-2">
            <Label>Gender</Label>
            <select
              value={formData.gender}
              onChange={(e) =>
                handleChange("gender", e.target.value)
              }
              className="border rounded-md px-3 py-2 w-full text-gray-600 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Diagnosis */}
          <div className="flex flex-col space-y-2">
            <Label>Diagnosis</Label>
            <Input
              value={formData.diagnosis}
              onChange={(e) =>
                handleChange("diagnosis", e.target.value)
              }
              placeholder="Enter diagnosis"
            />
          </div>

          {/* Age */}
          <div className="flex flex-col space-y-2">
            <Label>Age</Label>
            <Input
              type="number"
              value={formData.age}
              onChange={(e) =>
                handleChange("age", e.target.value)
              }
              placeholder="Enter age"
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                handleChange("startDate", e.target.value)
              }
              className="text-sm"
            />
          </div>

          {/* Week No */}
          <div className="flex flex-col space-y-2">
            <Label>Week No</Label>
            <Input
              type="number"
              value={formData.weekNo}
              onChange={(e) =>
                handleChange("weekNo", e.target.value)
              }
              placeholder="Enter week number"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col space-y-2">
            <Label>Status</Label>
            <select
              value={formData.status}
              onChange={(e) =>
                handleChange("status", e.target.value)
              }
              className="border rounded-md px-3 py-2 w-full text-sm text-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create</Button>
        </CardFooter>
      </Card>
    </div>
  );
}