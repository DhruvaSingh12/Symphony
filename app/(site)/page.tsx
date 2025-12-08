import getSongs from '@/actions/getSongs';
import Header from '@/components/Header';
import Sort from '@/components/Sort';
import PageContent from './components/PageContent';

export const revalidate = 0;

export default async function Home() {
  const songs = await getSongs();

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-none pr-2 pt-2">
        <Header className="bg-transparent">
          <div className="px-1">
            <h1 className="text-3xl font-semibold text-foreground">
              Welcome Listener
            </h1>
          </div>
          <div className="px-0 h-full overflow-hidden">
            <Sort songs={songs} ContentComponent={PageContent} />
          </div>
        </Header>
      </div>
    </div>
  );
}
