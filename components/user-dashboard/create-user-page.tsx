"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
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
    email: "",
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
      const res = await fetch(`${baseUrl}/api/users/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          weekNo: Number(formData.weekNo),
          startDate: new Date(formData.startDate).toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create user");

      onOpenChange(false);
      window.location.reload(); // refresh to show new data
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] flex justify-center items-center z-50">
      <Card className="w-full max-w-2xl bg-white rounded-xl shadow-xl">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-gray-800">Create New User</h2>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Each field group has spacing between label and input */}
          <div className="flex flex-col space-y-2">
            <Label>User ID</Label>
            <Input
              value={formData.uid}
              onChange={(e) => handleChange("uid", e.target.value)}
              placeholder="Enter user ID"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter name"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Email</Label>
            <Input
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter email"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Gender</Label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="border rounded-md px-3 py-2 w-full text-gray-600 focus:ring-2 text-sm focus:ring-gray-400 focus:outline-none"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Diagnosis</Label>
            <Input
              value={formData.diagnosis}
              onChange={(e) => handleChange("diagnosis", e.target.value)}
              placeholder="Enter diagnosis"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Age</Label>
            <Input
              type="number"
              value={formData.age}
              onChange={(e) => handleChange("age", e.target.value)}
              placeholder="Enter age"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Start Date</Label>
            <div className="relative">
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full pr-10 text-gray-600 text-sm border rounded-md focus:ring-2 focus:ring-gray-400 focus:outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Week No</Label>
            <Input
              type="number"
              value={formData.weekNo}
              onChange={(e) => handleChange("weekNo", e.target.value)}
              placeholder="Enter week number"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Status</Label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="border rounded-md px-3 py-2 w-full text-sm text-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="cursor-pointer" onClick={handleSubmit}>Create</Button>
        </CardFooter>
      </Card>
    </div>
  );
}