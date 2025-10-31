"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Marker = "P" | "A" | "L";

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days = [] as Array<{ date: Date; marker?: Marker }>;
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d);
    // mock markers
    const weekday = date.getDay();
    const marker: Marker | undefined = weekday === 0 || weekday === 6 ? undefined : d % 9 === 0 ? "L" : d % 7 === 0 ? "A" : "P";
    days.push({ date, marker });
  }
  return { first, last, days };
}

export default function EmployeeAttendanceHistoryPage() {
  const today = new Date();
  const { days, first } = buildMonth(today.getFullYear(), today.getMonth());
  const monthName = first.toLocaleString(undefined, { month: "long", year: "numeric" });

  const present = days.filter((d) => d.marker === "P").length;
  const absent = days.filter((d) => d.marker === "A").length;
  const late = days.filter((d) => d.marker === "L").length;

  const startWeekday = first.getDay();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Attendance History</h1>
        <p className="text-sm text-slate-600">Calendar view with color-coded markers and monthly summary.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader title={monthName} subtitle="Present (green) • Absent (red) • Late (amber)" />
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-slate-500">{d}</div>
              ))}
              {Array.from({ length: startWeekday }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map(({ date, marker }) => (
                <div key={date.toISOString()} className="rounded-lg border border-slate-200 bg-white p-2 text-center shadow-sm">
                  <div className="text-xs text-slate-500">{date.getDate()}</div>
                  {marker && (
                    <span
                      className={`mt-1 inline-block h-2 w-2 rounded-full ${
                        marker === "P" ? "bg-green-500" : marker === "A" ? "bg-rose-500" : "bg-amber-500"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Monthly Summary" />
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between"><span className="text-slate-600">Present</span><span className="font-semibold text-slate-900">{present}</span></li>
              <li className="flex items-center justify-between"><span className="text-slate-600">Absent</span><span className="font-semibold text-slate-900">{absent}</span></li>
              <li className="flex items-center justify-between"><span className="text-slate-600">Late</span><span className="font-semibold text-slate-900">{late}</span></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


