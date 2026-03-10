import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("w-full rounded-md border px-3 py-2 text-sm")} {...props} />;
}
