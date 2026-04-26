import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { getImageUrl } from "@/lib/tmdb"

interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

interface CastSectionProps {
  cast: CastMember[]
}

export function CastSection({ cast }: CastSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Cast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cast.slice(0, 12).map((member) => (
          <Card key={member.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-0">
              <div className="relative aspect-[2/3]">
                <Image
                  src={getImageUrl(member.profile_path) || "/placeholder.svg"}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm line-clamp-1">{member.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{member.character}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
