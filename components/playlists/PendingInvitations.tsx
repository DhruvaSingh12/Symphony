"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePendingInvitations } from "@/hooks/queries/useCollaborators";
import { useAcceptInvitation, useDeclineInvitation } from "@/hooks/mutations/useCollaboration";
import { PlaylistCollaborator } from "@/types";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserInitials, getUserDisplayName } from "@/lib/userUtils";
import { formatDistanceToNow } from "date-fns";

interface PendingInvitationsProps {
  className?: string;
  inDropdown?: boolean;
}

const PendingInvitations: React.FC<PendingInvitationsProps> = ({ className, inDropdown = false }) => {
  const { data: invitations = [], isLoading } = usePendingInvitations();
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();

  const invitationCount = invitations.length;
  const isProcessing = acceptMutation.isPending || declineMutation.isPending;

  const handleAccept = (playlistId: string) => acceptMutation.mutate(playlistId);
  const handleDecline = (playlistId: string) => declineMutation.mutate(playlistId);

  // Shared content component
  const InvitationsContent = (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : invitationCount === 0 ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No pending invitations</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="p-2 space-y-2">
            {invitations.map((invitation) => (
              <InvitationItem
                key={invitation.id}
                invitation={invitation}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isAccepting={acceptMutation.isPending}
                isDeclining={declineMutation.isPending}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  );

  // Render as submenu when inside another dropdown
  if (inDropdown) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
          {invitationCount > 0 && (
            <Badge
              variant="destructive"
              className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {invitationCount > 9 ? "9+" : invitationCount}
            </Badge>
          )}
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent className="w-[300px] p-0">
            {InvitationsContent}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  }

  // Render as standalone dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="h-5 w-5" />
          {invitationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {invitationCount > 9 ? "9+" : invitationCount}
            </Badge>
          )}
          <span className="sr-only">
            {invitationCount} pending invitation{invitationCount !== 1 ? "s" : ""}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px] p-0">
        {InvitationsContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Invitation Item Component
interface InvitationItemProps {
  invitation: PlaylistCollaborator;
  onAccept: (playlistId: string) => void;
  onDecline: (playlistId: string) => void;
  isAccepting: boolean;
  isDeclining: boolean;
  isProcessing: boolean;
}

const InvitationItem: React.FC<InvitationItemProps> = ({
  invitation,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
  isProcessing,
}) => {
  const avatarUrl = useLoadAvatar(invitation.user);
  const timeAgo = invitation.invited_at
    ? formatDistanceToNow(new Date(invitation.invited_at), { addSuffix: true })
    : null;

  return (
    <div className="rounded-md border p-3 space-y-3 bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage className="object-cover" src={avatarUrl || undefined} alt={getUserDisplayName(invitation.user)} />
          <AvatarFallback>{getUserInitials(invitation.user?.full_name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-medium">{getUserDisplayName(invitation.user, "Someone")}</span>
            {" "}invited you to collaborate to{" "}
            <span className="font-bold">{invitation.playlist?.name || "Untitled Playlist"}</span>.
          </p>
          {timeAgo && <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onAccept(invitation.playlist_id)} disabled={isProcessing} className="flex-1">
          {isAccepting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              Accept
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDecline(invitation.playlist_id)}
          disabled={isProcessing}
          className="flex-1"
        >
          {isDeclining ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <X className="mr-1.5 h-4 w-4" />
              Decline
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PendingInvitations;