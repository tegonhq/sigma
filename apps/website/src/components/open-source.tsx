import { Button, Card } from '@tegonhq/ui';
import { Container } from './utils';
import { useState, useEffect } from 'react';

interface GitHubStats {
  forks: number;
  stars: number;
  contributors: number;
  prsLastMonth: number;
}

export const OpenSource = () => {
  const [stats, setStats] = useState<GitHubStats>({
    forks: 0,
    stars: 0,
    contributors: 0,
    prsLastMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        // Fetch repository data
        const repoResponse = await fetch('https://api.github.com/repos/tegonhq/sigma');
        const repoData = await repoResponse.json();

        // Fetch contributors count
        const contributorsResponse = await fetch('https://api.github.com/repos/tegonhq/sigma/contributors?per_page=1');
        const contributorsCount = contributorsResponse.headers.get('link')
          ? parseInt(contributorsResponse.headers.get('link')?.match(/page=(\d+)>; rel="last"/)?.[1] || '0')
          : 1;

        // Fetch PRs from last month
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const prsResponse = await fetch(
          `https://api.github.com/repos/tegonhq/sigma/pulls?state=closed&since=${lastMonth.toISOString()}&per_page=100`
        );
        const prsData = await prsResponse.json();
        const mergedPRs = Array.isArray(prsData) ? prsData.filter(pr => pr.merged_at).length : 0;

        setStats({
          forks: repoData.forks_count || 0,
          stars: repoData.stargazers_count || 0,
          contributors: contributorsCount,
          prsLastMonth: mergedPRs,
        });
      } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        // Fallback to default values
        setStats({
          forks: 4347,
          stars: 60411,
          contributors: 491,
          prsLastMonth: 895,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString();
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <Container className="flex flex-col items-center px-4">
        {/* Main Box Container */}
        <Card className="relative w-full max-w-5xl p-6 md:p-10 lg:p-14 bg-background/95 border border-border/30 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm">
          {/* Statistics in corners */}
          {/* Top-left: Forks */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 lg:top-8 lg:left-8 text-left">
            <div className="text-xs md:text-sm text-muted-foreground/80 mb-1 font-medium">Forks</div>
            <div className="text-lg md:text-2xl lg:text-3xl font-bold text-blue-600">{formatNumber(stats.forks)}</div>
          </div>

          {/* Top-right: Stars */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 text-right">
            <div className="text-xs md:text-sm text-muted-foreground/80 mb-1 font-medium">Stars</div>
            <div className="text-lg md:text-2xl lg:text-3xl font-bold text-blue-600">{formatNumber(stats.stars)}</div>
          </div>

          {/* Bottom-left: Contributors */}
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 text-left">
            <div className="text-xs md:text-sm text-muted-foreground/80 mb-1 font-medium">Contributors</div>
            <div className="text-lg md:text-2xl lg:text-3xl font-bold text-blue-600">{formatNumber(stats.contributors)}</div>
          </div>

          {/* Bottom-right: PRs merged last month */}
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 text-right">
            <div className="text-xs md:text-sm text-muted-foreground/80 mb-1 font-medium hidden sm:block">PRs merged last month</div>
            <div className="text-xs md:text-sm text-muted-foreground/80 mb-1 font-medium sm:hidden">PRs last month</div>
            <div className="text-lg md:text-2xl lg:text-3xl font-bold text-blue-600">{formatNumber(stats.prsLastMonth)}</div>
          </div>

          {/* Background Contributor Avatars */}
          <div className="absolute inset-0 overflow-hidden opacity-10 md:opacity-15">
            {/* Scattered avatars throughout the card */}
            {Array.from({ length: 18 }, (_, i) => {
              const positions = [
                { top: '18%', left: '15%' },
                { top: '28%', right: '18%' },
                { top: '38%', left: '12%' },
                { top: '48%', right: '15%' },
                { top: '58%', left: '20%' },
                { top: '68%', right: '22%' },
                { top: '78%', left: '18%' },
                { top: '22%', left: '30%' },
                { top: '32%', right: '30%' },
                { top: '42%', left: '35%' },
                { top: '52%', right: '35%' },
                { top: '62%', left: '40%' },
                { top: '72%', right: '40%' },
                { top: '25%', right: '50%' },
                { top: '75%', left: '50%' },
                { top: '35%', right: '55%' },
                { top: '65%', right: '60%' },
                { top: '45%', left: '60%' },
              ];
              
              const position = positions[i % positions.length];
              
              return (
                <div
                  key={i}
                  className="absolute w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border border-border/20"
                  style={{
                    ...position,
                    background: `linear-gradient(135deg, hsl(${(i * 137.5) % 360}, 40%, 70%), hsl(${(i * 137.5 + 60) % 360}, 40%, 80%))`
                  }}
                />
              );
            })}
          </div>

          {/* Content will be positioned here */}
          <div className="relative z-10 flex items-center justify-center min-h-[280px] sm:min-h-[320px] md:min-h-[380px]">
            {/* Central content area */}
            <div className="text-center max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-4 md:px-6">
              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 text-blue-600">
                Open source
              </h2>
              
              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-10 text-muted-foreground/90 leading-relaxed max-w-md md:max-w-lg mx-auto">
                Sigma is built by a global community of thousands of developers.
              </p>
              
              {/* Call to action button */}
              <Button 
                size="lg" 
                className="text-sm sm:text-base px-6 py-3 md:px-8 md:py-4"
                onClick={() => window.open('https://github.com/tegonhq/sigma', '_blank')}
              >
                Start contributing →
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}; 