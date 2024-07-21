"use client";

import { useEffect, useState } from "react";

import AuthModal from "@/components/AuthModal";
import PlaylistFormModal from "@/components/PlaylistFormModal";
import UploadModal from "@/app/library/components/UploadModal";

const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }
    
    return (
        <>
          <AuthModal />
          <UploadModal />
          <PlaylistFormModal isOpen={false} onChange={function (open: boolean): void {
                throw new Error("Function not implemented.");
            } } songs={[]} playlists={[]} />
        </>
    );
}

export default ModalProvider;
