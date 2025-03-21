import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@tegonhq/ui';

interface DeleteListAlertProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  deleteList: () => void;
}

export function DeleteListAlert({
  open,
  setOpen,
  deleteList,
}: DeleteListAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="p-3">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove this
            list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteList()}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
