"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from "@/hooks/auth/useUser";
import useAuthModal from "@/hooks/ui/useAuthModal";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ListItemProps {
    image: string;
    name: string;
    href: string;
    requireAuth?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({
    image, name, href, requireAuth = true
}) => {
    const router = useRouter();
    const { user } = useUser();
    const authModal = useAuthModal();

    const onClick = () => {
        if (requireAuth && !user) {
            authModal.onOpen();
        } else {
            router.push(href);
        }
    };

    return (
        <Card
            onClick={onClick}
            className={cn(
                "group relative flex items-center gap-x-2 overflow-hidden cursor-pointer",
                "bg-card/60 hover:bg-accent/80 border-border transition p-0"
            )}
        >
            <div className="relative min-h-[64px] min-w-[64px]">
                <Image
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={image}
                    alt={name}
                />
            </div>
            <p className="font-medium truncate py-5 px-2 text-foreground">
                {name}
            </p>
        </Card>
    );
};

export default ListItem;
