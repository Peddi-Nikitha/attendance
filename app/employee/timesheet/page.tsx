"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { useDataStore } from "@/lib/datastore";

function exportCsv(rows: { date: string; in?: string; out?: string; total: string }[]) {
  const header = ["Date", "In", "Out", "Total Hours"]; 
  const data = rows.map((r) => [r.date, r.in || "", r.out || "", r.total]);
  const csv = [header, ...data].map((r) => r.join(",")).join("\n");
  const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  const a = document.createElement("a");
  a.href = uri;
  a.download = "timesheet.csv";
  a.click();
}

export default function EmployeeTimesheetPage() {
  const store = useDataStore();
  const employeeId = "e1";
  const [, force] = useState(0);

  useEffect(() => {
    const unsub = store.subscribe(() => force((x) => x + 1));
    return () => unsub();
  }, [store]);

  const logs = useMemo(() => {
    const items = store.attendance
      .filter((l) => l.employeeId === employeeId)
      .slice(0, 30)
      .map((l) => {
        const totalMs = l.checkIn && l.checkOut ? new Date(l.checkOut).getTime() - new Date(l.checkIn).getTime() : 0;
        const total = totalMs > 0 ? `${Math.floor(totalMs / 3600000)}h ${Math.floor((totalMs % 3600000) / 60000)}m` : "";
        return { date: l.date, in: l.checkIn ? new Date(l.checkIn).toLocaleTimeString() : undefined, out: l.checkOut ? new Date(l.checkOut).toLocaleTimeString() : undefined, total };
      });
    return items;
  }, [store.attendance]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Timesheet</h1>
        <p className="text-sm text-slate-600">List of daily logs (In/Out/Total Hours) with export option.</p>
      </div>

      <Card>
        <CardHeader title="Recent Logs" action={<button onClick={() => exportCsv(logs)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700">Export CSV</button>} />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-600">
                  <th className="border-b border-slate-200 px-3 py-2 font-medium">Date</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-medium">In</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-medium">Out</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50">
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-800">{row.date}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.in || "—"}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.out || "—"}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.total || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


