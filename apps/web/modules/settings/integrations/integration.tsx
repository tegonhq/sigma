import {
  ArrowLeft,
  Button,
  ChevronLeft,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@tegonhq/ui';

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
            <Breadcrumb className="text-base">
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <span className="inline-block">Integrations</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <div className="inline-flex items-center gap-1 min-w-[0px]">
                    <div className="truncate">{integrationDefinition.name}</div>
                  </div>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          }
          description={integrationDefinition.description}
        >
          <>
            <h2 className="text-md">{integrationDefinition.name}</h2>
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
