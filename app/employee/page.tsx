"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "../../lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { CalendarDays, Clock8, Leaf } from "lucide-react";
import { useDataStore } from "@/lib/datastore";

const weeklyData = [
  { name: "Mon", hours: 8 },
  { name: "Tue", hours: 7.5 },
  { name: "Wed", hours: 8 },
  { name: "Thu", hours: 6.5 },
  { name: "Fri", hours: 8 },
  { name: "Sat", hours: 0 },
  { name: "Sun", hours: 0 },
];

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const store = useDataStore();
  const employeeId = "e1"; // demo current user id
  const [checkedIn, setCheckedIn] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "employee") {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    // subscribe to datastore to reflect updates live
    const unsub = store.subscribe(() => {
      // naive inference of checked-in by presence of checkIn without checkOut today
      const date = new Date();
      const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const log = store.attendance.find((l) => l.employeeId === employeeId && l.date === today);
      setCheckedIn(!!(log?.checkIn && !log?.checkOut));
    });
    return () => unsub();
  }, [store]);

  const handleCheck = () => {
    const now = new Date();
    setTimestamp(now.toLocaleString());
    setCheckedIn((v) => !v);
    if (!checkedIn) {
      store.checkIn(employeeId);
    } else {
      store.checkOut(employeeId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Employee Dashboard</h1>
          <p className="text-sm text-slate-600">Track your attendance, leaves, and payslips easily.</p>
        </div>
        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:shadow"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader title="Today’s Status" subtitle="Current day" />
          <CardContent>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                checkedIn ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}>{checkedIn ? "Present" : "Not Checked-In"}</span>
              <span className="text-xs text-slate-500">{timestamp || "—"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Total Working Days" subtitle="This month" />
          <CardContent>
            <div className="text-2xl font-semibold">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Total Leaves Taken" subtitle="This year" />
          <CardContent>
            <div className="text-2xl font-semibold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Upcoming Holidays" subtitle="Next 30 days" />
          <CardContent>
            <ul className="text-sm text-slate-700">
              <li className="flex items-center gap-2"><CalendarDays size={16} className="text-blue-600" /> Nov 05 - Diwali</li>
              <li className="flex items-center gap-2"><CalendarDays size={16} className="text-blue-600" /> Nov 25 - Founders Day</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleCheck} size="lg">
              <Clock8 className="mr-2" size={18} /> {checkedIn ? "Check-Out" : "Check-In"}
            </Button>
            <span className="text-xs text-slate-500">{timestamp ? `Last action: ${timestamp}` : ""}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Weekly Hours Worked" subtitle="Last 7 days" />
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
                <YAxis tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
                <Tooltip cursor={{ fill: "#EEF2FF" }} />
                <Bar dataKey="hours" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Quick Access" />
        <CardContent>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="/employee/leave" className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 transition hover:bg-blue-100"><Leaf size={16} /> Apply Leave</a>
            <a href="/employee/payslips" className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 transition hover:bg-blue-100">💰 View Payslip</a>
            <a href="/employee/attendance-history" className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 transition hover:bg-blue-100">📅 Attendance Report</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


