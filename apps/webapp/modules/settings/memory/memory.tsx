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
  Loader,
  useToast,
} from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { SettingSection } from '../setting-section';

const MemoryFormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL' }),
  apiKey: z.string().min(1, { message: 'API Key is required' }),
});

export const Memory = observer(() => {
  const { isLoading } = useGetIntegrationDefinitions();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof MemoryFormSchema>>({
    resolver: zodResolver(MemoryFormSchema),
    defaultValues: {
      url: 'https://core.heysol.ai',
      apiKey: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof MemoryFormSchema>) => {
    try {
      const res = await fetch(`${values.url.replace(/\/$/, '')}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': values.apiKey,
        },
        body: JSON.stringify({ query: 'name' }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || 'Failed to connect to API');
      }

      const data = await res.json();
      console.log('API Success:', data);
      toast({
        title: 'Success!',
        description: 'Successfully connected to the Memory API.',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error!',
        description: e?.message || 'Failed to connect to the Memory API.',
      });
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto px-4 py-6">
      <SettingSection title="Memory" description="Edit user preferences/memory">
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
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" className="w-fit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </SettingSection>
    </div>
  );
});
