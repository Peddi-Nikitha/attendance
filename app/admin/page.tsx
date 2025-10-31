"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import { useDataStore } from "@/lib/datastore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function AdminDashboardPage() {
  const router = useRouter();
  const store = useDataStore();
  const [, force] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      router.replace("/login");
    }
    const unsub = store.subscribe(() => force((x) => x + 1));
    return () => unsub();
  }, [router]);

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const totalEmployees = store.employees.length;
  const todayLogs = store.attendance.filter((l) => l.date === today);
  const present = todayLogs.filter((l) => l.checkIn && l.checkOut).length;
  const late = todayLogs.filter((l) => l.checkIn && !l.checkOut).length; // simplistic: currently checked-in -> "late/ongoing"
  const absent = Math.max(0, totalEmployees - (present + late));
  const activeLeaves = store.leaves.filter((l) => l.status === "Approved").length;
  const pendingApprovals = store.leaves.filter((l) => l.status === "Pending").length;

  const monthlyData = useMemo(() => {
    // build last 12 months counts of present days across all employees
    const arr: { name: string; value: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const count = store.attendance.filter((l) => l.date.startsWith(key) && l.checkIn && l.checkOut).length;
      arr.push({ name: d.toLocaleString(undefined, { month: "short" }), value: count });
    }
    return arr;
  }, [store.attendance]);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-neutral-500">Manage employees, attendance, payroll and more</p>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader title="Total Employees" />
          <CardContent><div className="text-3xl font-semibold">{totalEmployees}</div></CardContent>
        </Card>
        <Card>
          <CardHeader title="Today's Attendance" />
          <CardContent>
            <div className="text-sm">Present: <span className="font-semibold text-green-600">{present}</span></div>
            <div className="text-sm">Absent: <span className="font-semibold text-rose-600">{absent}</span></div>
            <div className="text-sm">Late/Ongoing: <span className="font-semibold text-amber-600">{late}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Active Leaves" />
          <CardContent><div className="text-3xl font-semibold">{activeLeaves}</div></CardContent>
        </Card>
        <Card>
          <CardHeader title="Pending Approvals" />
          <CardContent><div className="text-3xl font-semibold">{pendingApprovals}</div></CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Monthly Attendance Trend" />
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
                  <YAxis tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
                  <Tooltip cursor={{ stroke: "#93C5FD" }} />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <div className="grid gap-3">
              <a href="/admin/employees" className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white">Add Employee</a>
              <a href="/admin/payslips" className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white">Generate Payslip</a>
              <a href="/admin/reports" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-center text-sm">View Reports</a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


