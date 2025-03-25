import { Button, Loader } from '@tegonhq/ui';
import React from 'react';

import { SettingSection } from 'modules/settings/setting-section';

import { toProperCase } from 'common/common-utils';
import { getIcon, type IconType } from 'common/icon-utils';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { Integration } from './integration';

interface IntegrationCardProps {
  name: string;
  description: string;
  href: string;
  onView: () => void;
  icon: string;
}

function IntegrationCard({
  name,
  description,
  icon,
  onView,
}: IntegrationCardProps) {
  const Icon = getIcon(icon as IconType);

  return (
    <div className="p-3 rounded-md cursor-pointer bg-background-3">
      <div className="flex items-center gap-2">
        <div className="border p-1 rounded-md dark:bg-foreground">
          <Icon size={24} className="dark:text-background" />
        </div>
        <div className="grow">
          <div className="font-medium"> {name} </div>
          <div className="text-muted-foreground text-sm">{description}</div>
        </div>
        <div>
          <Button variant="secondary" onClick={onView}>
            View
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Integrations() {
  const { data: integrations, isLoading } = useGetIntegrationDefinitions();
  const [integration, setIntegration] = React.useState(undefined);

  if (isLoading) {
    return <Loader />;
  }

  if (integration) {
    return (
      <Integration
        integrationDefinitionId={integration}
        onBack={() => setIntegration(undefined)}
      />
    );
  }

  return (
    <SettingSection
      title="Integrations"
      description="Manage your workspace integrations"
    >
      <div className="flex flex-col gap-2">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            name={toProperCase(integration.name)}
            description={integration.description}
            href={integration.id}
            icon={integration.icon}
            onView={() => setIntegration(integration.id)}
          />
        ))}
      </div>
    </SettingSection>
  );
}
