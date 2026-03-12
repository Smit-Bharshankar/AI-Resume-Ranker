import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/AlertDialog";

type DeleteConfirmButtonProps = {
  confirmTitle: string;
  confirmDescription: string;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  isPending?: boolean;
  className?: string;
};

export function DeleteConfirmButton({
  confirmTitle,
  confirmDescription,
  onConfirm,
  disabled = false,
  isPending = false,
  className,
}: DeleteConfirmButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || isPending}
          className={cn("text-destructive hover:text-destructive", className)}
          aria-label="Delete"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => void onConfirm()}>
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
