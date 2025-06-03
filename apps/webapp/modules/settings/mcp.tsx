import { Button, useToast } from '@redplanethq/ui';
import React from 'react';

import { useUpdateUserMutation } from 'services/users';

import { UserContext } from 'store/user-context';

import { JSONEditor } from './json-editor';
import { SettingSection } from './setting-section';

export const MCP = () => {
  const user = React.useContext(UserContext);

  const [jsonValue, setJsonValue] = React.useState(
    JSON.stringify(user.mcp, null, 2),
  );
  const [error, setError] = React.useState(undefined);
  const { mutate: updateUser } = useUpdateUserMutation({});
  const { toast } = useToast();

  const handleJSONChange = (json: string) => {
    setJsonValue(json);

    try {
      JSON.parse(json);
      setError(undefined);
    } catch (e) {
      setError(e);
    }
  };

  const update = () => {
    try {
      updateUser(
        { userId: user.id, mcp: jsonValue },
        {
          onSuccess: () => {
            toast({
              title: 'Success',
              description: 'MCP details are updated',
            });
          },
        },
      );
    } catch (e) {
      setError(e);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <SettingSection title="MCP" description="Edit mcp config">
        {error && <p> JSON parsing error </p>}
        <JSONEditor
          autoFocus
          defaultValue={jsonValue}
          readOnly={false}
          basicSetup
          onChange={(v) => {
            handleJSONChange(v);
          }}
          showClearButton={false}
          showCopyButton={false}
          height="100%"
          min-height="100%"
          max-height="100%"
        />
      </SettingSection>

      <div className="px-4">
        <Button type="submit" variant="secondary" onClick={update}>
          Update
        </Button>
      </div>
    </div>
  );
};
