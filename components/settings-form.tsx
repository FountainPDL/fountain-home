"use client"

import { useState, useEffect } from "react"
import { getUserPreferences, updateUserPreferences, type UserPreferences } from "@/lib/storage"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Check } from "lucide-react"

export function SettingsForm() {
  const { theme, setTheme } = useTheme()
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultServer: "vidsrc",
    autoplay: true,
    theme: "system",
    filterAdultContent: false, // Added default value
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const prefs = getUserPreferences()
    setPreferences(prefs)
    if (prefs.theme !== "system") {
      setTheme(prefs.theme)
    }
  }, [setTheme])

  const handleSave = () => {
    updateUserPreferences(preferences)
    setTheme(preferences.theme)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select
          value={preferences.theme}
          onValueChange={(value: "light" | "dark" | "system") => setPreferences({ ...preferences, theme: value })}
        >
          <SelectTrigger id="theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">Choose your preferred color theme</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="server">Default Server</Label>
        <Select
          value={preferences.defaultServer}
          onValueChange={(value) => setPreferences({ ...preferences, defaultServer: value })}
        >
          <SelectTrigger id="server">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vidsrc">VidSrc</SelectItem>
            <SelectItem value="2embed">2Embed</SelectItem>
            <SelectItem value="autoembed">AutoEmbed</SelectItem>
            <SelectItem value="superembed">SuperEmbed</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">Your preferred streaming server</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="autoplay">Autoplay Next Episode</Label>
          <p className="text-sm text-muted-foreground">Automatically play the next episode for TV shows</p>
        </div>
        <Switch
          id="autoplay"
          checked={preferences.autoplay}
          onCheckedChange={(checked) => setPreferences({ ...preferences, autoplay: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="adult-filter">Filter Adult Content</Label>
          <p className="text-sm text-muted-foreground">Hide R-rated, NC-17, and TV-MA content</p>
        </div>
        <Switch
          id="adult-filter"
          checked={preferences.filterAdultContent}
          onCheckedChange={(checked) => setPreferences({ ...preferences, filterAdultContent: checked })}
        />
      </div>

      <Button onClick={handleSave} className="w-full">
        {saved ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Saved!
          </>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </div>
  )
}
