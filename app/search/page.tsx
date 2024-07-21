import getSongsByQuery from "@/actions/getSongsByQuery";
import Header from "@/components/Header";
import SearchInput from "./components/SearchInput";
import SearchContent from "./components/SearchContent";
import Box from "@/components/Box";

interface SearchProps {
    searchParams: {
        query?: string;
    }
};

export const revalidate = 0;

const Search = async ({ searchParams }: SearchProps) => {
    const { query } = searchParams;
    const songs = await getSongsByQuery(query || "");

    return (
        <div className="
            bg-neutral-900
            rounded-lg
            h-full
            w-full
            overflow-hidden
            overflow-y-auto
        ">
            <div className="
                w-full
                flex
                flex-col
                gap-y-2
                bg-black
                h-full
            ">
                <Box>
                    <Header>
                        <div className="mb-2 flex flex-col gap-y-3">
                            <h1 className="text-white text-3xl font-semibold">
                                Search
                            </h1>
                            <SearchInput />
                        </div>
                    </Header>
                </Box>
                <Box className="overflow-y-auto flex-1 h-full">
                    <div className="mt-4 mb-4">
                        <SearchContent songs={songs} />
                    </div>
                </Box>
            </div>
        </div>
    )
};

export default Search;
