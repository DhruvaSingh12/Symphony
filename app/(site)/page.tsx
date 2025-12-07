import getSongs from '@/actions/getSongs';
import ListItem from '@/components/ListItem';
import Header from '@/components/Header';
import Sort from '@/components/Sort';
import PageContent from './components/PageContent';
import { Card } from '@/components/ui/card';

export const revalidate = 0;

export default async function Home() {
  const songs = await getSongs();

  return (
    <div className="h-full w-full space-y-4">
      <Header className="bg-transparent">
        <div className="mb-2 px-1">
          <h1 className="text-3xl font-semibold text-foreground">
            Welcome Listener
          </h1>
          <div className="
            grid
            grid-cols-2
            sm:grid-cols-3
            xl:grid-cols-4
            2xl:grid-cols-6
            gap-3
            mt-4
          ">
            <ListItem 
              image="/images/artists.avif"
              name="Artists"
              href="artist"
              requireAuth={false} 
            />
            <ListItem 
              image="/images/liked.jpg"
              name="Liked Songs"
              href="liked"
            />
            <ListItem 
              image="/images/library.jpeg"
              name="Library"
              href="library"
            />
          </div>
        </div>
      </Header>
      <Card className="bg-card/60 border-border mt-2 mx-2">
        <div className="px-6 py-4">
          <Sort songs={songs} ContentComponent={PageContent} />
        </div>
      </Card>
    </div>
  );
}
