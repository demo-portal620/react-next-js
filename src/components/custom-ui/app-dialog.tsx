"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Generic modal wrapper - title/show/onClose/onSave contract, ported from
// an earlier scaffold's HeyDialog. Deliberately dropped its hand-rolled
// drag/resize logic (not needed here - a fixed-size modal covers every
// current use case) and kept just the header/body/footer/save/cancel
// convention.
interface AppDialogProps {
  title?: ReactNode;
  show: boolean;
  onClose: () => void;
  onSave?: () => void;
  showHeader?: boolean;
  showFooter?: boolean;
  showSave?: boolean;
  showCancel?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  saveVariant?: "default" | "destructive";
  width?: string;
  height?: string;
  children: ReactNode;
}

export default function AppDialog({
  title,
  show,
  onClose,
  onSave,
  showHeader = true,
  showFooter = true,
  showSave = true,
  showCancel = true,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  saveVariant = "default",
  width,
  height,
  children,
}: AppDialogProps) {
  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        // DialogContent's own class already caps width at
        // calc(100%-2rem) so it can never overflow a narrow viewport -
        // an inline maxWidth here would override that (inline style always
        // beats a class), so callers requesting a fixed width (e.g. 480px)
        // still get clamped down on a phone screen via min(), not just cut
        // off past the edge.
        style={{ width, maxWidth: width ? `min(${width}, calc(100% - 2rem))` : undefined, height }}
        className="flex max-h-[90vh] flex-col"
      >
        {showHeader && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="flex-1 overflow-auto">{children}</div>
        {showFooter && (
          <DialogFooter>
            {showCancel && (
              <Button variant="outline" onClick={onClose}>
                {cancelLabel}
              </Button>
            )}
            {showSave && (
              <Button variant={saveVariant} onClick={onSave}>
                {saveLabel}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
