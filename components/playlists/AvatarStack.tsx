"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import { UserDetails } from "@/types";
import { getUserInitials, getUserDisplayName } from "@/lib/userUtils";
import useLoadAvatar from "@/hooks/data/useLoadAvatar";
import * as React from "react";

const avatarStackVariants = cva("flex", {
  variants: {
    orientation: {
      vertical: "flex-row -space-x-3",
      horizontal: "flex-col -space-y-3",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    orientation: "vertical",
    size: "md",
  },
});

const avatarSizeVariants = cva("border-2 border-background", {
  variants: {
    size: {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface AvatarStackProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof avatarStackVariants> {
  users: UserDetails[];
  maxAvatarsAmount?: number;
}

// Individual avatar component that uses useLoadAvatar
const UserAvatarImage: React.FC<{ user: UserDetails }> = ({ user }) => {
  const avatarUrl = useLoadAvatar(user);
  return (
    <AvatarImage
      className="object-cover"
      src={avatarUrl || undefined}
      alt={getUserDisplayName(user)}
    />
  );
};

const AvatarStack = ({
  className,
  orientation,
  size,
  users,
  maxAvatarsAmount = 3,
  ...props
}: AvatarStackProps) => {
  const shownUsers = users.slice(0, maxAvatarsAmount);
  const hiddenUsers = users.slice(maxAvatarsAmount);

  return (
    <TooltipProvider>
      <div
        className={cn(avatarStackVariants({ orientation }), className)}
        {...props}
      >
        {shownUsers.map((user, index) => (
          <Tooltip key={`${user.id}-${index}`}>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  avatarSizeVariants({ size }),
                  "hover:z-10 transition-transform hover:scale-110 cursor-pointer"
                )}
              >
                <UserAvatarImage user={user} />
                <AvatarFallback>
                  {getUserInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getUserDisplayName(user)}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {hiddenUsers.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  avatarSizeVariants({ size }),
                  "hover:z-10 transition-transform hover:scale-110 cursor-pointer"
                )}
              >
                <AvatarFallback className="text-xs font-medium">
                  +{hiddenUsers.length}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {hiddenUsers.map((user, index) => (
                  <p key={`${user.id}-${index}`}>{getUserDisplayName(user)}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export { AvatarStack, avatarStackVariants };