"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface PatientDetails {
  name: string;
  age: string;
  mrn: string;
  hospital: string;
}

interface PatientDetailsFormProps {
  details: PatientDetails;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PatientDetailsForm: React.FC<PatientDetailsFormProps> = ({ details, onChange }) => {
  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-custom border rounded-xl mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center text-gray-700 dark:text-gray-200">
          Patient Details (Optional)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hospital" className="text-sm font-medium text-gray-600 dark:text-gray-300">Hospital Name</Label>
            <Input id="hospital" name="hospital" value={details.hospital} onChange={onChange} placeholder="e.g., General Hospital" />
          </div>
          <div>
            <Label htmlFor="mrn" className="text-sm font-medium text-gray-600 dark:text-gray-300">MR Number</Label>
            <Input id="mrn" name="mrn" value={details.mrn} onChange={onChange} placeholder="e.g., 12345678" />
          </div>
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-600 dark:text-gray-300">Patient Name</Label>
            <Input id="name" name="name" value={details.name} onChange={onChange} placeholder="e.g., John Doe" />
          </div>
          <div>
            <Label htmlFor="age" className="text-sm font-medium text-gray-600 dark:text-gray-300">Age</Label>
            <Input id="age" name="age" value={details.age} onChange={onChange} placeholder="e.g., 45" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};