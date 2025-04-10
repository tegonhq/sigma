import { Badge } from '@tegonhq/ui';
import Link from 'next/link';

interface FeatureProps {
  Icon: React.ReactNode;
  text: string;
  href?: string;
}

export const Feature = ({ Icon, text, href }: FeatureProps) => {
  const BadgeContent = (
    <Badge
      className="inline-flex h-8 items-center p-1.5 gap-1.5 relative top-0.5 mx-1.5 text-xl border-1 border-border rounded-md transition-transform hover:rotate-3"
      variant="secondary"
    >
      {Icon} {text}
    </Badge>
  );

  if (href) {
    return (
      <Link href={href}>
        {BadgeContent}
      </Link>
    );
  }

  return BadgeContent;
};
