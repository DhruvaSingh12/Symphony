"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserSearchState } from "@/hooks/queries/useUserSearch";
import { useInviteCollaborator } from "@/hooks/mutations/useCollaboration";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { getUserInitials, getUserDisplayName } from "@/lib/userUtils";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserDetails } from "@/types";
import { FaCircleXmark } from "react-icons/fa6";

interface InviteCollaboratorProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  playlistName: string;
  existingCollaboratorIds?: string[];
}

const InviteCollaborator: React.FC<InviteCollaboratorProps> = ({
  isOpen,
  onClose,
  playlistId,
  playlistName,
  existingCollaboratorIds = [],
}) => {
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasMinimumQuery,
  } = useUserSearchState();
  const inviteMutation = useInviteCollaborator();
  
  // Memoize filtered users to avoid recalculation on every render
  const availableUsers = useMemo(() => {
    return searchResults.filter(
      (user) => !existingCollaboratorIds.includes(user.id)
    );
  }, [searchResults, existingCollaboratorIds]);

  const handleInvite = async () => {
    if (!selectedUser) return;
    inviteMutation.mutate(
      {
        playlistId,
        userId: selectedUser.id,
      },
      {
        onSuccess: () => {
          setSelectedUser(null);
          setSearchQuery("");
          // Small delay for visual feedback before closing
          setTimeout(() => {
            onClose();
          }, 300);
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[400px] rounded-lg py-4 md:py-6 md:px-6 px-3">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
          <DialogDescription>
            Add people to <span className="font-medium">{playlistName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          {!selectedUser && (
            <div className="space-y-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search users"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          )}

          {/* Search Results */}
          {hasMinimumQuery && !selectedUser && (
            <ScrollArea className="h-[200px] rounded-md border">
              {availableUsers.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  {isSearching ? "Searching..." : "No users found"}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {availableUsers.map((user) => (
                    <UserSearchResult
                      key={user.id}
                      user={user}
                      onClick={() => setSelectedUser(user)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Selected User Display */}
          {selectedUser && (
            <div className="space-y-2">
              <div className="flex flex-row justify-between items-center">
                <UserSearchResult user={selectedUser} />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove selected user"
                  onClick={() => setSelectedUser(null)}
                  className="rounded-full"
                >
                  <FaCircleXmark size={32}/>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Collaborators can add and remove songs from this playlist.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!selectedUser || inviteMutation.isPending}
          >
            {inviteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// User Search Result Component
interface UserSearchResultProps {
  user: UserDetails;
  onClick?: () => void;
}

const UserSearchResult: React.FC<UserSearchResultProps> = ({
  user,
  onClick,
}) => {
  const avatarUrl = useLoadAvatar(user);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-md p-3 transition-colors",
        onClick && "hover:bg-accent cursor-pointer",
        !onClick && "cursor-default"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage
          className="object-cover"
          src={avatarUrl || undefined}
          alt={getUserDisplayName(user)}
        />
        <AvatarFallback>{getUserInitials(user.full_name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">
          {getUserDisplayName(user)}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {user.id}
        </p>
      </div>
    </button>
  );
};

export default InviteCollaborator;