import { BookMark, Button } from '@redplanethq/ui';

interface FavouriteButtonProps {
  favourite: boolean;
  onChange: (favourite: boolean) => void;
}

export const FavouriteButton = ({
  onChange,
  favourite,
}: FavouriteButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="xs"
      className="flex items-center"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        onChange(!favourite);
      }}
    >
      {favourite ? (
        <BookMark size={14} className="text-amber-600" />
      ) : (
        <BookMark size={14} />
      )}
    </Button>
  );
};
