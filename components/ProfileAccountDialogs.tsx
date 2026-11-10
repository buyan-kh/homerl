"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button-clean";
import { TextField } from "@/components/ui/text-field-clean";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProfileAccountDialogsProps = {
  editOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  name: string;
  email: string;
  onSaveProfile: (name: string, email: string) => void;
  resetOpen: boolean;
  onResetOpenChange: (open: boolean) => void;
  onConfirmReset: () => void;
};

export function ProfileAccountDialogs({
  editOpen,
  onEditOpenChange,
  name,
  email,
  onSaveProfile,
  resetOpen,
  onResetOpenChange,
  onConfirmReset,
}: ProfileAccountDialogsProps) {
  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);

  useEffect(() => {
    if (!editOpen) return;
    setDraftName(name);
    setDraftEmail(email);
  }, [editOpen, name, email]);

  function saveProfile() {
    const nextName = draftName.trim();
    const nextEmail = draftEmail.trim();
    if (!nextName) return;
    onSaveProfile(nextName, nextEmail || "Progress saved in this browser");
    onEditOpenChange(false);
  }

  return (
    <>
      <Dialog open={editOpen} onOpenChange={onEditOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>
              Shown on your account card in the sidebar. Progress still stays in this browser only.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <TextField
              label="Display name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Your name"
              autoFocus
            />
            <TextField
              label="Subtitle"
              hint="A short line under your name — e.g. how progress is stored."
              optional
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
              placeholder="Progress saved in this browser"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onEditOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" disabled={!draftName.trim()} onClick={saveProfile}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={resetOpen} onOpenChange={onResetOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears spaced-repetition memory for every deck in this browser. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                onConfirmReset();
                onResetOpenChange(false);
              }}
            >
              Reset progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
