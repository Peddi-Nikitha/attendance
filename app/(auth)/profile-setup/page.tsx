import React from "react";
import { Button } from "../../../components/ui/button";

export default function ProfileSetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-md flex flex-col gap-6">
        <div className="text-center text-2xl font-bold text-blue-700 mb-2">Complete Your Profile</div>
        <form className="flex flex-col gap-4">
          <input type="text" placeholder="Full Name" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white" />
          <input type="email" placeholder="Email Address" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white" />
          <input type="text" placeholder="Contact Number" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white" />
          <input type="text" placeholder="Department" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white" />
          <Button type="submit" className="w-full mt-2">Save & Continue</Button>
        </form>
      </div>
    </div>
  );
}
