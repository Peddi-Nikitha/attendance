"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock8 } from "lucide-react";
import { useDataStore } from "@/lib/datastore";

export default function EmployeeMarkAttendancePage() {
  const store = useDataStore();
  const employeeId = "e1"; // demo current user id
  const [checkedIn, setCheckedIn] = useState<boolean>(false);
  const [lastActionAt, setLastActionAt] = useState<string>("");
  const [gpsOk, setGpsOk] = useState<boolean>(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => setGpsOk(true),
      () => setGpsOk(false),
      { enableHighAccuracy: true, timeout: 3000 }
    );
  }, []);

  const handleAction = () => {
    const now = new Date();
    setLastActionAt(now.toLocaleString());
    setCheckedIn((v) => !v);
    if (!checkedIn) {
      store.checkIn(employeeId);
    } else {
      store.checkOut(employeeId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mark Attendance</h1>
        <p className="text-sm text-slate-600">Check-In / Check-Out with current time and GPS capture indicator.</p>
      </div>

      <Card>
        <CardHeader title="Status" />
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-600">Current time</div>
              <div className="text-2xl font-semibold">{new Date().toLocaleTimeString()}</div>
              <div className="mt-2 text-xs text-slate-500">{lastActionAt ? `Last action at ${lastActionAt}` : "No actions yet"}</div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm">
              <MapPin size={16} className={gpsOk ? "text-green-600" : "text-amber-600"} />
              GPS {gpsOk ? "Captured" : "Not Available"}
            </div>
            <Button size="lg" onClick={handleAction}>
              <Clock8 className="mr-2" size={18} /> {checkedIn ? "Check-Out" : "Check-In"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


