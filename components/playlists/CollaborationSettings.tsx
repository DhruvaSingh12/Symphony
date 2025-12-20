"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaylistCollaborator } from "@/types";
import { useRemoveCollaborator, useTransferOwnership } from "@/hooks/mutations/useCollaboration";
import { useCollaborators } from "@/hooks/queries/useCollaborators";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { getUserInitials, getUserDisplayName } from "@/lib/userUtils";
import { MoreVertical, Crown, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CollaborationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  playlistName: string;
  currentUserId: string;
  ownerId: string;
  isOwner: boolean;
  className?: string;
}

type DialogState = { open: boolean; userId: string | null; userName: string | null; isPending?: boolean; };

const CollaborationSettings: React.FC<CollaborationSettingsProps> = ({
  isOpen,
  onClose,
  playlistId,
  playlistName,
  currentUserId,
  ownerId,
  isOwner,
  className,
}) => {
  const { data: collaborators = [], isLoading } = useCollaborators(playlistId);
  const removeMutation = useRemoveCollaborator();
  const transferMutation = useTransferOwnership();

  const [removeDialog, setRemoveDialog] = useState<DialogState>({
    open: false,
    userId: null,
    userName: null,
    isPending: false,
  });
  const [transferDialog, setTransferDialog] = useState<DialogState>({
    open: false,
    userId: null,
    userName: null,
  });

  const handleRemove = () => {
    if (!removeDialog.userId) return;
    removeMutation.mutate(
      { playlistId, userId: removeDialog.userId },
      {
        onSuccess: () => {
          setTimeout(() => setRemoveDialog({ open: false, userId: null, userName: null }), 300);
        },
      }
    );
  };

  const handleTransfer = () => {
    if (!transferDialog.userId) return;
    transferMutation.mutate(
      { playlistId, newOwnerId: transferDialog.userId },
      {
        onSuccess: () => {
          setTimeout(() => setTransferDialog({ open: false, userId: null, userName: null }), 300);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const acceptedCollaborators = collaborators
    .filter((c) => c.status === "accepted" || c.user_id === ownerId)
    .sort((a) => (a.user_id === ownerId ? -1 : 1));

  const pendingCollaborators = collaborators.filter((c) => c.status === "pending");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] rounded-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Collaboration Settings</DialogTitle>
          <DialogDescription>
            Manage collaboration for {playlistName}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh]">
          <div className={cn("space-y-4", className)}>
      {/* Active Collaborators */}
      <div className="space-y-2">
        {acceptedCollaborators.map((collaborator) => (
          <CollaboratorItem
            key={collaborator.id || collaborator.user_id}
            collaborator={collaborator}
            isOwner={isOwner}
            isCurrentUser={collaborator.user_id === currentUserId}
            isPlaylistOwner={collaborator.user_id === ownerId}
            onRemove={() =>
              setRemoveDialog({
                open: true,
                userId: collaborator.user_id!,
                userName: collaborator.user?.full_name || "this user",
                isPending: false,
              })
            }
            onTransferOwnership={() =>
              setTransferDialog({
                open: true,
                userId: collaborator.user_id!,
                userName: collaborator.user?.full_name || "Unknown User",
              })
            }
          />
        ))}
      </div>

      {/* Pending Invitations */}
      {isOwner && pendingCollaborators.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">
            Pending Invitations ({pendingCollaborators.length})
          </h3>
          <div className="space-y-2">
            {pendingCollaborators.map((collaborator) => (
              <CollaboratorItem
                key={collaborator.id}
                collaborator={collaborator}
                isOwner={isOwner}
                isCurrentUser={false}
                isPlaylistOwner={false}
                isPending={true}
                onRemove={() =>
                  setRemoveDialog({
                    open: true,
                    userId: collaborator.user_id!,
                    userName: collaborator.user?.full_name || "this user",
                    isPending: true,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {acceptedCollaborators.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            No collaborators yet. Invite someone to get started!
          </p>
        </div>
      )}
    </div>
        </ScrollArea>
      </DialogContent>

      {/* Remove Dialog */}
      <Dialog
        open={removeDialog.open}
        onOpenChange={() => setRemoveDialog({ open: false, userId: null, userName: null })}
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {removeDialog.isPending ? "Cancel Invitation" : "Remove Collaborator"}
            </DialogTitle>
            <DialogDescription>
              {removeDialog.isPending
                ? `Cancel the invitation for ${removeDialog.userName}?`
                : `Remove ${removeDialog.userName} from this playlist? They will lose access.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialog({ open: false, userId: null, userName: null })}
              disabled={removeMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleRemove} disabled={removeMutation.isPending} className="hover:text-red-400">
              {removeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {removeDialog.isPending ? "Cancel" : "Remove"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog
        open={transferDialog.open}
        onOpenChange={() => setTransferDialog({ open: false, userId: null, userName: null })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Transfer Ownership</DialogTitle>
            <DialogDescription>
              Transfer ownership to {transferDialog.userName}? You will become a collaborator.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransferDialog({ open: false, userId: null, userName: null })}
              disabled={transferMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleTransfer} disabled={transferMutation.isPending}>
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4" />
                  Transfer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

// Collaborator Item Component
interface CollaboratorItemProps {
  collaborator: PlaylistCollaborator;
  isOwner: boolean;
  isCurrentUser: boolean;
  isPlaylistOwner: boolean;
  isPending?: boolean;
  onRemove: () => void;
  onTransferOwnership?: () => void;
}

const CollaboratorItem: React.FC<CollaboratorItemProps> = ({
  collaborator,
  isOwner,
  isCurrentUser,
  isPlaylistOwner,
  isPending = false,
  onRemove,
  onTransferOwnership,
}) => {
  const avatarUrl = useLoadAvatar(collaborator.user ?? null);
  const joinedTime = collaborator.accepted_at
    ? formatDistanceToNow(new Date(collaborator.accepted_at), { addSuffix: true })
    : null;

  return (
    <div className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarImage
            className="object-cover"
            src={avatarUrl || undefined}
            alt={getUserDisplayName(collaborator.user)}
          />
          <AvatarFallback>
            {getUserInitials(collaborator.user?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {getUserDisplayName(collaborator.user)}
            {isCurrentUser && (
              <span className="text-muted-foreground ml-1">(You)</span>
            )}
          </p>
          {!isPending && joinedTime && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Joined {joinedTime}
            </p>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      {isOwner && !isPlaylistOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isPending && onTransferOwnership && (
              <>
                <DropdownMenuItem onClick={onTransferOwnership}>
                  <Crown className="mr-2 h-4 w-4" />
                  Transfer Ownership
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={onRemove}
              className="focus:text-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isPending ? "Cancel Invitation" : "Remove"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default CollaborationSettings;