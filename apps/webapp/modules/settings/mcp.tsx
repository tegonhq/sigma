import { Textarea } from '@tegonhq/ui';
import React from 'react';

import { SettingSection } from './setting-section';

export const MCP = () => {
  const [jsonValue, setJsonValue] = React.useState('{}');
  const handleJSONChange = (json: string) => {
    setJsonValue(json);
  };

  return (
    <div className="flex flex-col gap-2">
      <SettingSection title="MCP" description="Edit mcp config">
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
    </div>
  );
};
