import { Header } from '@/components/Header'
import { CreatorProfile } from './CreatorProfile'

interface PageProps {
  params: {
    id: string
  }
}

export default function CreatorPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CreatorProfile creatorId={params.id} />
    </div>
  )
}
