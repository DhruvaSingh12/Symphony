"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePendingInvitations } from "@/hooks/queries/useCollaborators";
import { useAcceptInvitation, useDeclineInvitation } from "@/hooks/mutations/useCollaboration";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Bell, Check, X, Music, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface PendingInvitationsProps {
    className?: string;
}

const PendingInvitations: React.FC<PendingInvitationsProps> = ({ className }) => {
    const { data: invitations = [], isLoading } = usePendingInvitations();
    const acceptMutation = useAcceptInvitation();
    const declineMutation = useDeclineInvitation();

    const invitationCount = invitations.length;

    const handleAccept = (playlistId: string) => {
        acceptMutation.mutate(playlistId);
    };

    const handleDecline = (playlistId: string) => {
        declineMutation.mutate(playlistId);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("relative", className)}
                >
                    <Bell className="h-5 w-5" />
                    {invitationCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {invitationCount > 9 ? '9+' : invitationCount}
                        </Badge>
                    )}
                    <span className="sr-only">
                        {invitationCount} pending invitation{invitationCount !== 1 ? 's' : ''}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0">
                <div className="flex items-center justify-between p-4 pb-3">
                    <h3 className="font-semibold">Playlist Invitations</h3>
                    {invitationCount > 0 && (
                        <Badge variant="secondary">{invitationCount}</Badge>
                    )}
                </div>
                <Separator />

                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : invitationCount === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8">
                        <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No pending invitations
                        </p>
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
                                />
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Invitation Item Component
interface InvitationItemProps {
    invitation: any; // PlaylistCollaborator with playlist data
    onAccept: (playlistId: string) => void;
    onDecline: (playlistId: string) => void;
    isAccepting: boolean;
    isDeclining: boolean;
}

const InvitationItem: React.FC<InvitationItemProps> = ({
    invitation,
    onAccept,
    onDecline,
    isAccepting,
    isDeclining
}) => {
    const avatarUrl = useLoadAvatar(invitation.user);
    
    // For playlist images, we need to handle it differently since it's not a user avatar
    const supabaseClient = useSupabaseClient();
    const playlistImageUrl = invitation.playlist?.image_path 
        ? supabaseClient.storage.from('images').getPublicUrl(invitation.playlist.image_path).data.publicUrl
        : null;

    const getInitials = (name?: string) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    };

    const timeAgo = invitation.invited_at
        ? formatDistanceToNow(new Date(invitation.invited_at), { addSuffix: true })
        : null;

    return (
        <div className="rounded-md border p-3 space-y-3 bg-card hover:bg-accent/50 transition-colors">
            {/* Inviter Info */}
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage
                        src={avatarUrl || undefined}
                        alt={invitation.user?.full_name || "User"}
                    />
                    <AvatarFallback>
                        {getInitials(invitation.user?.full_name)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm">
                        <span className="font-medium">
                            {invitation.user?.full_name || "Someone"}
                        </span>
                        {' '}invited you to collaborate
                    </p>
                    {timeAgo && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {timeAgo}
                        </p>
                    )}
                </div>
            </div>

            {/* Playlist Info */}
            <div className="flex items-center gap-3 pl-1">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                    {playlistImageUrl ? (
                        <img
                            src={playlistImageUrl}
                            alt={invitation.playlist?.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <Music className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                        {invitation.playlist?.name || "Untitled Playlist"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Collaborator access
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={() => onAccept(invitation.playlist_id)}
                    disabled={isAccepting || isDeclining}
                    className="flex-1"
                >
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
                    disabled={isAccepting || isDeclining}
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