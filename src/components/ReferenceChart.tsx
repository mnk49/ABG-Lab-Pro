"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const referenceValues = [
  { name: "pH", value: "7.35 - 7.45" },
  { name: "PaCO₂", value: "35 - 45 mmHg" },
  { name: "HCO₃⁻", value: "22 - 26 mEq/L" },
];

export const ReferenceChart = () => {
  return (
    <Card className="w-full bg-white shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center text-gray-700">
          Reference Ranges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {referenceValues.map((item) => (
            <li key={item.name} className="flex justify-between items-center text-gray-600">
              <span className="font-medium">{item.name}</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-sm">{item.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};