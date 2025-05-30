
// Re-export the toast functionality from the hooks directory
export { useToast, toast } from "@/hooks/use-toast";
// Use ToastProps from the toast component instead of non-existent Toast type
export type { ToastProps as Toast } from "@/components/ui/toast";
