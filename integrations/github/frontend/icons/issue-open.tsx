interface IconProps {
  size: number;
}

export const IssueOpenIcon = ({ size }: IconProps) => {
  return (
    <svg viewBox="0 0 16 16" fill="#1a7f37" width={size} height={size}>
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
    </svg>
  );
};
