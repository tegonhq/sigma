import { Button, Textarea, useToast } from '@tegonhq/ui';
import React from 'react';

import { useUpdateUserMutation } from 'services/users';

import { UserContext } from 'store/user-context';

import { SettingSection } from './setting-section';

export const MCP = () => {
  const user = React.useContext(UserContext);

  const [jsonValue, setJsonValue] = React.useState(JSON.stringify(user.mcp));
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
  };

  return (
    <div className="flex flex-col gap-2">
      <SettingSection title="MCP" description="Edit mcp config">
        {error && <p> JSON parsing error </p>}

        <Textarea
          value={jsonValue}
          onChange={(e) => handleJSONChange(e.target.value)}
          className="font-mono text-sm"
          rows={10}
          placeholder="Enter your JSON data here..."
        >
          <div>{jsonValue}</div>
        </Textarea>
      </SettingSection>

      <div className="px-4">
        <Button type="submit" variant="secondary" onClick={update}>
          Update
        </Button>
      </div>
    </div>
  );
};
