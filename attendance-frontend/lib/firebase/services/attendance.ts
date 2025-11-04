import { db } from "@/lib/firebase/config";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";

export type GpsLocation = { latitude: number; longitude: number };

export type AttendanceDoc = {
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: "present" | "absent" | "half-day" | "holiday" | "leave";
  checkIn?: {
    timestamp: Timestamp;
    location?: GpsLocation;
    method: "manual" | "gps" | "qr" | "system";
  };
  checkOut?: {
    timestamp: Timestamp;
    location?: GpsLocation;
    method: "manual" | "gps" | "qr" | "system";
  };
  totalHours?: number; // hours (decimal)
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

function toYmdLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function attendanceDocRef(employeeId: string, d: Date = new Date()) {
  const date = toYmdLocal(d);
  const id = `${employeeId}_${date}`;
  return doc(collection(db, "attendance"), id);
}

export async function getTodayAttendance(employeeId: string) {
  const ref = attendanceDocRef(employeeId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as AttendanceDoc) : null;
}

export function listenTodayAttendance(
  employeeId: string,
  callback: (doc: AttendanceDoc | null) => void
): Unsubscribe {
  const ref = attendanceDocRef(employeeId);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as AttendanceDoc) : null);
  });
}

export async function checkIn(employeeId: string, gps?: GpsLocation) {
  const ref = attendanceDocRef(employeeId);
  await runTransaction(db, async (tx) => {
    const curr = await tx.get(ref);
    const now = new Date();
    const date = toYmdLocal(now);

    if (curr.exists()) {
      const data = curr.data() as AttendanceDoc;
      // Enforce one check-in/out cycle per day
      if (data.checkIn || data.checkOut) {
        throw new Error("Attendance already recorded for today");
      }
    }

    if (!curr.exists()) {
      tx.set(ref, {
        employeeId,
        date,
        status: "present",
        checkIn: {
          timestamp: serverTimestamp(),
          location: gps ?? undefined,
          method: gps ? "gps" : "manual",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as Partial<AttendanceDoc>);
    } else {
      // If doc exists but had neither checkIn nor checkOut (edge), set once
      tx.set(
        ref,
        {
          status: "present",
          checkIn: {
            timestamp: serverTimestamp(),
            location: gps ?? undefined,
            method: gps ? "gps" : "manual",
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  });
}

export async function checkOut(employeeId: string, gps?: GpsLocation) {
  const ref = attendanceDocRef(employeeId);
  await runTransaction(db, async (tx) => {
    const curr = await tx.get(ref);
    if (!curr.exists()) {
      throw new Error("No check-in found for today");
    }
    const data = curr.data() as AttendanceDoc;
    if (!data.checkIn) {
      throw new Error("No check-in found for today");
    }
    if (data.checkOut) {
      throw new Error("Already checked out");
    }

    // Provisional total hours using client time and stored check-in timestamp
    let totalHours: number | undefined;
    try {
      const inMs = data.checkIn.timestamp.toMillis();
      const outMs = Date.now();
      const diffHours = (outMs - inMs) / (1000 * 60 * 60);
      totalHours = Math.max(0, Number(diffHours.toFixed(2)));
    } catch {
      totalHours = undefined;
    }

    tx.set(
      ref,
      {
        checkOut: {
          timestamp: serverTimestamp(),
          location: gps ?? undefined,
          method: gps ? "gps" : "manual",
        },
        totalHours: totalHours ?? undefined,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
}


