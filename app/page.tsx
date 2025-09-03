import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PenTool,
  BookOpen,
  Settings,
  Zap,
  Shield,
  Palette,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: PenTool,
      title: "Modern Editor",
      description:
        "Write with a beautiful, distraction-free editor with live markdown preview and auto-save.",
    },
    {
      icon: Zap,
      title: "Fast",
      description:
        "Built with Next.js and optimized for performance. Your blog loads instantly.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with automatic backups and version control.",
    },
    {
      icon: Palette,
      title: "Beautiful Design",
      description:
        "Stunning themes and customizable layouts that make your content shine.",
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2">
                Modern Blog Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black text-balance leading-tight">
                Write, Publish, and Share Your Stories
              </h1>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
                BlogCraft is a modern blog platform that helps you focus on what
                matters most - creating amazing content that resonates with your
                audience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/editor">
                <Button size="lg" className="text-lg px-8 py-6">
                  <PenTool className="mr-2 h-5 w-5" />
                  Start Writing
                </Button>
              </Link>
              <Link href="/blog">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 bg-transparent"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-balance">
                Everything You Need to Blog
              </h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                Powerful features designed to help you create, manage, and grow
                your blog with ease.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-8">
                      <div className="space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-black text-balance">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-pretty leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/editor">
                <Button size="lg" className="text-lg px-8 py-6">
                  <PenTool className="mr-2 h-5 w-5" />
                  Create Post
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 bg-transparent"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Manage Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
