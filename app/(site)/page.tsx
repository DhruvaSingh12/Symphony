import getSongs from '@/actions/getSongs';
import ListItem from '@/components/ListItem';
import Header from '@/components/Header';
import Sort from '@/components/Sort';
import PageContent from './components/PageContent';
import Box from '@/components/Box';

export const revalidate = 0;

function getRandomGradient() {
  const gradients = [
    ['from-red-700', 'to-yellow-700'],
    ['from-green-700', 'to-blue-700'],
    ['from-indigo-700', 'to-purple-700'],
    ['from-pink-700', 'to-orange-700'],
    ['from-teal-700', 'to-cyan-700'],
    ['from-lime-700', 'to-amber-700'],
    ['from-emerald-700', 'to-violet-700'],
    ['from-fuchsia-700', 'to-rose-700'],
    ['from-sky-700', 'to-teal-900'],
    ['from-red-700', 'to-pink-700'],
    ['from-purple-700', 'to-indigo-700'],
    ['from-blue-700', 'to-cyan-700'],
    ['from-green-700', 'to-lime-700'],
    ['from-amber-700', 'to-orange-700'],
    ['from-emerald-700', 'to-fuchsia-700'],
    ['from-indigo-700', 'to-teal-700'],
    ['from-red-700', 'to-amber-700'],
    ['from-purple-700', 'to-pink-700'],
    ['from-green-700', 'to-fuchsia-700'],
  ];
  const randomIndex = Math.floor(Math.random() * gradients.length);
  return gradients[randomIndex];
}

export default async function Home() {
  const songs = await getSongs();
  const [fromColor, toColor] = getRandomGradient();

  return (
    <div className="h-full w-full rounded-lg">
      <Box>  
        <Header>
          <div className="mb-2 px-1">
            <h1 className="text-white text-3xl font-semibold">
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
                image="/images/artists.webp"
                name="Artists"
                href="artist"
              />
              <ListItem 
                image="/images/liked.png"
                name="Liked Songs"
                href="liked"
              />
              <ListItem 
                image="/images/lib2.png"
                name="Library"
                href="library"
              />
            </div>
          </div>
        </Header>
      </Box>
      <Box className={`bg-gradient-to-b ${fromColor} ${toColor}`}>  
        <div className="mt-2 pb-10 px-6 h-full">
          <Sort songs={songs} ContentComponent={PageContent} />
        </div>
      </Box>
    </div>
  );
}
