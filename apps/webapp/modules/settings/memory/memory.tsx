import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  useToast,
} from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useUpdateWorkspaceMutation } from 'services/workspace';

import { UserContext } from 'store/user-context';

import { SettingSection } from '../setting-section';

const MemoryFormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL' }),
  apiKey: z.string().min(1, { message: 'API Key is required' }),
});

export const Memory = observer(() => {
  const user = React.useContext(UserContext);
  const preferences = user.workspace.preferences;

  const { mutate: updateWorkspace } = useUpdateWorkspaceMutation({});
  const { toast } = useToast();

  // State to control whether we are editing or just showing the host
  const [editing, setEditing] = React.useState(
    !preferences.memory_host, // If no host, show form by default
  );

  // Prefill form with memory_host if present, else default
  const form = useForm<z.infer<typeof MemoryFormSchema>>({
    resolver: zodResolver(MemoryFormSchema),
    defaultValues: {
      url: preferences.memory_host || 'https://core.heysol.ai',
      apiKey: preferences.memory_api_key || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof MemoryFormSchema>) => {
    try {
      const res = await fetch(`${values.url.replace(/\/$/, '')}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${values.apiKey}`,
        },
        body: JSON.stringify({ query: 'name' }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || 'Failed to connect to API');
      }

      await res.json();

      updateWorkspace({
        name: user.workspace.name,
        workspaceId: user.workspace.id,
        preferences: {
          ...preferences,
          memory_host: values.url,
          memory_api_key: values.apiKey,
        },
      });

      toast({
        title: 'Success!',
        description: 'Successfully connected to the Memory API.',
      });

      setEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error!',
        description: e?.message || 'Failed to connect to the Memory API.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto px-4 py-6">
      <SettingSection title="Memory" description="Edit user preferences/memory">
        {preferences.memory_host && !editing ? (
          <div className="flex gap-4 max-w-md min-w-[500px] bg-background-3 justify-between rounded p-3 items-center">
            <div>
              <span className="font-semibold">Memory:</span>{' '}
              <span>{preferences.memory_host}</span>
            </div>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                className="w-fit"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 flex flex-col max-w-md min-w-[500px]"
            >
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memory API URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://core.heysol.ai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your API Key"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                {preferences.memory_host && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-fit"
                    onClick={() => {
                      setEditing(false);
                      // Reset form to current preferences in case user cancels
                      form.reset({
                        url: preferences.memory_host,
                        apiKey: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="secondary" className="w-fit">
                  Save
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SettingSection>
    </div>
  );
});
