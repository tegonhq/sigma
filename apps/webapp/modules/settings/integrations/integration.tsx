import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@redplanethq/ui';

import { SettingSection } from 'modules/settings/setting-section';

import { useGetIntegrationDefinition } from 'services/integration-definition';

import { IntegrationAuth } from './integration-auth';
import { IntegrationAuthAPI } from './integration-auth-api';

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
      {!isLoading && integrationDefinition && (
        <SettingSection
          title={
            <Breadcrumb className="text-base">
              <BreadcrumbList className="gap-0">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={onBack}
                    className="flex items-center gap-2"
                  >
                    <span className="inline-block">Integrations</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>
                    <div className="inline-flex items-center gap-1 min-w-[0px]">
                      <div className="truncate">
                        {integrationDefinition.name}
                      </div>
                    </div>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          description={integrationDefinition.description}
        >
          <>
            {integrationDefinition.spec.auth['OAuth2'] ? (
              <IntegrationAuth integrationDefinition={integrationDefinition} />
            ) : (
              <IntegrationAuthAPI
                integrationDefinition={integrationDefinition}
              />
            )}
          </>
        </SettingSection>
      )}
    </>
  );
}
