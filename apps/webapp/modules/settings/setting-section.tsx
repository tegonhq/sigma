interface SettingSectionProps {
  title: React.ReactNode | string;
  description: string;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function SettingSection({
  title,
  description,
  metadata,
  children,
  actions,
}: SettingSectionProps) {
  return (
    <div className="flex flex-col gap-6 p-3">
      <div className="flex justify-between">
        <div className="shrink-0 flex flex-col">
          <h3 className="text-lg"> {title} </h3>
          <p className="text-muted-foreground">{description}</p>
          {metadata ? metadata : null}
        </div>

        <div>{actions}</div>
      </div>
      <div className="grow">
        <div className="flex h-full justify-center w-full">
          <div className="grow flex flex-col gap-2 h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
