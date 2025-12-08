import getSongsByQuery from "@/actions/getSongsByQuery";
import Header from "@/components/Header";
import SearchInput from "./components/SearchInput";
import SearchContent from "./components/SearchContent";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchProps {
    searchParams: Promise<{
        query?: string;
    }>;
};

export const revalidate = 0;

const Search = async ({ searchParams }: SearchProps) => {
    const params = await searchParams;
    const { query } = params;
    const songs = await getSongsByQuery(query || "");

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="mb-2 flex flex-col gap-y-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold text-foreground">Search</h1>
                            <Badge variant="outline" className="rounded-full">
                                {songs.length} results
                            </Badge>
                        </div>
                        <SearchInput />
                    </div>
                </Header>
            </div>
            <div className="w-full overflow-hidden pr-2 mt-2 pb-2">
                <ScrollArea className="h-full">
                    <SearchContent songs={songs} />
                </ScrollArea>
            </div>
        </div>
    )
};

export default Search;
