import EmployeeShell from "@/components/layout/EmployeeShell";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
	return <EmployeeShell>{children}</EmployeeShell>;
}


