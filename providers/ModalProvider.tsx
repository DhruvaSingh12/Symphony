"use client";

import { useEffect, useState } from "react";

import AuthModal from "@/components/AuthModal";
import PlaylistModal from "@/components/PlaylistModal";
import AlbumModal from "@/components/AlbumModal";
import QueueModal from "@/components/QueueModal";

const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setTimeout(() => setIsMounted(true), 0);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <AuthModal />
            <PlaylistModal />
            <AlbumModal />
            <QueueModal />
        </>
    );
}

export default ModalProvider;