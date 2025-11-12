import { Header } from '@/components/Header'
import { TrackCard } from '@/components/TrackCard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Heart, Share2, Twitter, Instagram, Globe, Award } from 'lucide-react'
import { motion } from 'framer-motion'

// Mock artist data
const artistData = {
  id: '1',
  name: 'Burna Boy',
  bio: 'Damini Ebunoluwa Ogulu, known professionally as Burna Boy, is a Nigerian singer, songwriter, and record producer. He rose to stardom in 2012 after releasing "Like to Party", the lead single from his debut studio album L.I.F.E. He is one of the biggest and most successful African artists, known for his fusion of dancehall, reggae, Afrobeat, and pop.',
  image: '/api/placeholder/400/400',
  country: 'Nigeria',
  followers: '15.2M',
  verified: true,
  socialLinks: {
    twitter: 'https://twitter.com/burnaboy',
    instagram: 'https://instagram.com/burnaboy',
    website: 'https://www.onaspaceship.com'
  },
  topTracks: [
    {
      id: '1',
      title: 'Last Last',
      artist: 'Burna Boy',
      albumArt: '/api/placeholder/300/300',
      duration: '2:52',
      streams: '245M'
    },
    {
      id: '2',
      title: 'Ye',
      artist: 'Burna Boy',
      albumArt: '/api/placeholder/300/300',
      duration: '3:51',
      streams: '189M'
    },
    {
      id: '3',
      title: 'On the Low',
      artist: 'Burna Boy',
      albumArt: '/api/placeholder/300/300',
      duration: '3:05',
      streams: '156M'
    },
    {
      id: '4',
      title: 'Anybody',
      artist: 'Burna Boy',
      albumArt: '/api/placeholder/300/300',
      duration: '3:08',
      streams: '134M'
    },
    {
      id: '5',
      title: 'Gbona',
      artist: 'Burna Boy',
      albumArt: '/api/placeholder/300/300',
      duration: '3:17',
      streams: '112M'
    }
  ],
  achievements: [
    'Grammy Award Winner (2021)',
    'BET Award Winner',
    'MTV Europe Music Award',
    'African Artist of the Year'
  ],
  countryHighlights: [
    {
      title: 'Lagos Music Scene',
      description: 'Leading figure in the vibrant Lagos music scene'
    },
    {
      title: 'Nigerian Afrobeats',
      description: 'Pioneer of modern Afrobeats sound'
    },
    {
      title: 'African Giant',
      description: 'Named "African Giant" for cultural impact'
    }
  ]
}

export default function ArtistPage({ params }: { params: { id: string } }) {
  const artist = artistData

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <section className="relative h-80 md:h-96 bg-gradient-to-br from-purple-900 to-pink-700">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${artist.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <div className="flex items-end gap-6">
            <motion.div
              className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl border-4 border-background overflow-hidden"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${artist.image})` }}
              />
            </motion.div>
            
            <div className="text-white pb-2">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl md:text-6xl font-bold">{artist.name}</h1>
                {artist.verified && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-white/80 text-lg">{artist.followers} followers • {artist.country}</p>
              
              <div className="flex items-center gap-4 mt-4">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 font-semibold">
                  <Play className="h-5 w-5 mr-2" />
                  Play
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Heart className="h-5 w-5 mr-2" />
                  Follow
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tracks" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracks">Top Tracks</TabsTrigger>
            <TabsTrigger value="bio">Bio</TabsTrigger>
            <TabsTrigger value="country">Country Highlights</TabsTrigger>
          </TabsList>

          {/* Top Tracks Tab */}
          <TabsContent value="tracks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artist.topTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <TrackCard track={track} rank={index + 1} showRank={true} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Bio Tab */}
          <TabsContent value="bio" className="space-y-6">
            <motion.div
              className="bg-card rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">About {artist.name}</h2>
              <p className="text-muted-foreground leading-relaxed">{artist.bio}</p>
              
              {/* Achievements */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {artist.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Connect
                </h3>
                <div className="flex gap-4">
                  {artist.socialLinks.twitter && (
                    <a href={artist.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                    </a>
                  )}
                  {artist.socialLinks.instagram && (
                    <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Button>
                    </a>
                  )}
                  {artist.socialLinks.website && (
                    <a href={artist.socialLinks.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Country Highlights Tab */}
          <TabsContent value="country" className="space-y-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {artist.countryHighlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  className="bg-card rounded-2xl p-6 card-hover"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <h3 className="text-xl font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-muted-foreground">{highlight.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Community Badge */}
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Discovered by JamFind</h3>
                  <p className="text-white/80">This artist was featured in our Billboard charts, helping them reach new audiences across Africa.</p>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
