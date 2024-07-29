import Input from '@/app/search/components/Input';
import React from 'react';

interface ArtistSearchProps {
    onSearch: (searchTerm: string) => void;
}

const ArtistSearch: React.FC<ArtistSearchProps> = ({ onSearch }) => {
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(event.target.value);
    };

    return (
        <Input
            type="text"
            onChange={handleSearch}
            placeholder="Search artists"
        />
    );
};

export default ArtistSearch;
