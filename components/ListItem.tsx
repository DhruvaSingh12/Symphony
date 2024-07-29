"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ListItemProps {
    image: string;
    name: string;
    href: string;
}

const ListItem: React.FC<ListItemProps> = ({
    image, name, href
}) => {
    const router = useRouter();

    const onClick = () => {
        router.push(href);
    };

    return (
        <div 
            onClick={onClick}
            className="
                relative
                group
                flex
                items-center
                rounded-md
                overflow-hidden
                gap-x-1
                bg-neutral-200/20
                hover:bg-neutral-600/35
                transition
                pr-1
                cursor-pointer
            "
        >
            <div className="
                relative
                min-h-[64px]
                min-w-[64px]
            ">
                <Image
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={image}
                    alt="Image"
                />
            </div>
            <p className="font-medium truncate py-5">
                {name}
            </p>
        </div>
    );
};

export default ListItem;
