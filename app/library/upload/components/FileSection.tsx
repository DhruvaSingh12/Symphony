"use client";

import { UseFormRegister, FieldValues } from "react-hook-form";
import { Music, Image as ImageIcon } from "lucide-react";

interface FileSectionProps {
    register: UseFormRegister<FieldValues>;
    isLoading: boolean;
}

const FileSection: React.FC<FileSectionProps> = ({ register, isLoading }) => {
    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Audio File Input */}
                <div className="relative group">
                    <input
                        {...register('song', { required: true })}
                        type="file"
                        accept=".mp3"
                        id="song-upload"
                        className="peer sr-only"
                        disabled={isLoading}
                    />
                    <label
                        htmlFor="song-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-foreground/50 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="mb-3 text-border transition-colors group-hover:text-foreground/50">
                                <Music className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <p className="mb-1 text-sm text-foreground font-medium">Click to upload song</p>
                            <p className="text-xs text-muted-foreground">MP3 format only</p>
                        </div>
                    </label>
                </div>

                {/* Cover Image Input */}
                <div className="relative group">
                    <input
                        {...register('image', { required: true })}
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        className="peer sr-only"
                        disabled={isLoading}
                    />
                    <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-foreground/50 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="mb-3 text-border transition-colors group-hover:text-foreground/50">
                                <ImageIcon className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <p className="mb-1 text-sm text-foreground font-medium">Click to upload cover</p>
                            <p className="text-xs text-muted-foreground">JPG, PNG</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default FileSection;
