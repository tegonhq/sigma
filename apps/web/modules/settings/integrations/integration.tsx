import { ArrowLeft, Button, ChevronLeft } from '@tegonhq/ui';

import { SettingSection } from 'modules/settings/setting-section';

import { useGetIntegrationDefinition } from 'services/integration-definition';

import { IntegrationAuth } from './integration-auth';

interface IntegrationProps {
  integrationDefinitionId: string;
  onBack: () => void;
}

export function Integration({
  integrationDefinitionId,
  onBack,
}: IntegrationProps) {
  const { data: integrationDefinition, isLoading } =
    useGetIntegrationDefinition(integrationDefinitionId as string);

  return (
    <>
      {!isLoading && (
        <SettingSection
          title={
            <div className="flex gap-1">
              <Button
                variant="ghost"
                onClick={onBack}
                className="group my-2 p-0 my-0 flex justify-start hover:bg-transparent text-md"
              >
                <ArrowLeft className="mr-1" size={14} />
                Integrations
              </Button>
            </div>
          }
          description={integrationDefinition.description}
        >
          <>
            <IntegrationAuth integrationDefinition={integrationDefinition} />
            {integrationDefinition.spec && (
              <IntegrationAuth
                integrationDefinition={integrationDefinition}
                personal
              />
            )}
          </>
        </SettingSection>
      )}
    </>
  );
}
