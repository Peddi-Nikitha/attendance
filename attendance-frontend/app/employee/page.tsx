"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "../../lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { CalendarDays, Clock8, Leaf } from "lucide-react";
import { useAuth } from "@/lib/firebase/hooks/useAuth";
import { useAttendanceToday, useCheckIn, useCheckOut } from "@/lib/firebase/hooks/useAttendance";
import { useEmployeeByUserId } from "@/lib/firebase/hooks/useEmployees";

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
  const { user } = useAuth();
  const { employee, loading: employeeLoading } = useEmployeeByUserId(user?.uid);
  const employeeId = employee?.id || user?.uid;
  const { data, checkedIn, loading: attendanceLoading } = useAttendanceToday(employeeId);
  const { mutate: doCheckIn, loading: checkInLoading, error: checkInError } = useCheckIn();
  const { mutate: doCheckOut, loading: checkOutLoading, error: checkOutError } = useCheckOut();
  const [timestamp, setTimestamp] = useState<string>("");
  const [runningHours, setRunningHours] = useState<string>("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "employee") {
      router.replace("/login");
    }
  }, [router]);

  // Update timestamp based on last action from Firestore
  useEffect(() => {
    if (data?.checkOut) {
      setTimestamp(data.checkOut.timestamp.toDate().toLocaleString());
    } else if (data?.checkIn) {
      setTimestamp(data.checkIn.timestamp.toDate().toLocaleString());
    } else {
      setTimestamp("");
    }
  }, [data?.checkIn, data?.checkOut]);

  // Live hours while checked in
  useEffect(() => {
    if (!checkedIn || !data?.checkIn?.timestamp) {
      setRunningHours("");
      return;
    }
    const calc = () => {
      try {
        const inMs = data.checkIn!.timestamp.toMillis();
        const nowMs = Date.now();
        const hours = (nowMs - inMs) / (1000 * 60 * 60);
        setRunningHours(hours.toFixed(2));
      } catch {
        setRunningHours("");
      }
    };
    calc();
    const id = setInterval(calc, 30000);
    return () => clearInterval(id);
  }, [checkedIn, data?.checkIn?.timestamp]);

  const displayTotal = (() => {
    if (data?.checkOut && data?.checkIn) {
      if (typeof data.totalHours === "number") return data.totalHours.toFixed(2);
      try {
        const inMs = data.checkIn.timestamp.toMillis();
        const outMs = data.checkOut.timestamp.toMillis();
        const hours = (outMs - inMs) / (1000 * 60 * 60);
        return Math.max(0, Number(hours.toFixed(2))).toFixed(2);
      } catch {
        return "";
      }
    }
    if (checkedIn && runningHours) return runningHours;
    return "";
  })();

  async function handleCheck() {
    if (!employeeId) return;
    const now = new Date();
    setTimestamp(now.toLocaleString());
    if (!checkedIn) {
      await doCheckIn(employeeId);
    } else {
      await doCheckOut(employeeId);
    }
  }

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
            {displayTotal && (
              <div className="mt-2 text-xs text-slate-500">
                {data?.checkOut ? "Total hours" : "Working so far"}: {displayTotal}
              </div>
            )}
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
            <Button
              onClick={handleCheck}
              className="px-5 py-2.5 text-base"
              disabled={!employeeId || employeeLoading || attendanceLoading || checkInLoading || checkOutLoading}
            >
              <Clock8 className="mr-2" size={18} /> {checkedIn ? "Check-Out" : "Check-In"}
            </Button>
            <span className="text-xs text-slate-500">{timestamp ? `Last action: ${timestamp}` : ""}</span>
          </div>
          {(checkInError || checkOutError) && (
            <div className="mt-2 text-sm text-red-600">{(checkInError || checkOutError)?.message}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Weekly Hours Worked" subtitle="Last 7 days" />
        <CardContent>
          <div className="h-64 w-full" style={{ minWidth: 0, minHeight: 0 }}>
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


