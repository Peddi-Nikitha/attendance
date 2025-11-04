"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock8 } from "lucide-react";
import { useAuth } from "@/lib/firebase/hooks/useAuth";
import { useAttendanceToday, useCheckIn, useCheckOut } from "@/lib/firebase/hooks/useAttendance";
import { useEmployeeByUserId } from "@/lib/firebase/hooks/useEmployees";

export default function EmployeeMarkAttendancePage() {
  const { user, userProfile } = useAuth();
  const { employee, loading: employeeLoading } = useEmployeeByUserId(user?.uid);
  const employeeId = employee?.id || user?.uid;
  const { data, checkedIn, loading: attendanceLoading } = useAttendanceToday(employeeId);
  const { mutate: doCheckIn, loading: checkInLoading, error: checkInError } = useCheckIn();
  const { mutate: doCheckOut, loading: checkOutLoading, error: checkOutError } = useCheckOut();
  const [lastActionAt, setLastActionAt] = useState<string>("");
  const [gpsOk, setGpsOk] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [runningHours, setRunningHours] = useState<string>("");
  const [nowStr, setNowStr] = useState<string>("");

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

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsOk(true);
        setGpsCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      () => {
        setGpsOk(false);
        setGpsCoords(undefined);
      },
      { enableHighAccuracy: true, timeout: 3000 }
    );
  }, []);

  // Client-only clock to avoid hydration mismatch
  useEffect(() => {
    const tick = () => setNowStr(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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

  const handleAction = async () => {
    if (!employeeId) return;
    const now = new Date();
    setLastActionAt(now.toLocaleString());
    if (!checkedIn) {
      await doCheckIn(employeeId, gpsCoords);
    } else {
      await doCheckOut(employeeId, gpsCoords);
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
              <div className="text-2xl font-semibold" suppressHydrationWarning>{nowStr || "—"}</div>
              <div className="mt-2 text-xs text-slate-500">{lastActionAt ? `Last action at ${lastActionAt}` : "No actions yet"}</div>
              {data?.checkIn && (
                <div className="mt-1 text-xs text-slate-500">Checked in: {data.checkIn.timestamp.toDate().toLocaleTimeString()}</div>
              )}
              {data?.checkOut && (
                <div className="mt-1 text-xs text-slate-500">Checked out: {data.checkOut.timestamp.toDate().toLocaleTimeString()}</div>
              )}
              {displayTotal && (
                <div className="mt-1 text-xs text-slate-500">{data?.checkOut ? "Total hours" : "Working so far"}: {displayTotal}</div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm">
              <MapPin size={16} className={gpsOk ? "text-green-600" : "text-amber-600"} />
              GPS {gpsOk ? "Captured" : "Not Available"}
            </div>
            {data?.checkOut ? (
              <Button className="px-5 py-2.5 text-base" disabled>
                <Clock8 className="mr-2" size={18} /> Completed
              </Button>
            ) : (
              <Button
                className="px-5 py-2.5 text-base"
                onClick={handleAction}
              disabled={!employeeId || employeeLoading || attendanceLoading || checkInLoading || checkOutLoading}
              >
                <Clock8 className="mr-2" size={18} />
                {checkInLoading || checkOutLoading ? "Processing..." : checkedIn ? "Check-Out" : "Check-In"}
              </Button>
            )}
          </div>
          {(checkInError || checkOutError) && (
            <div className="mt-3 text-sm text-red-600">{(checkInError || checkOutError)?.message}</div>
          )}
          {checkedIn && runningHours && (
            <div className="mt-3 text-sm text-slate-700">Working so far: {runningHours} hours</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


