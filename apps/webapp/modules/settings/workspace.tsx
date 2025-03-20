import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useWorkspace } from 'hooks/workspace';

import {
  useUpdateWorkspaceMutation,
  type UpdateWorkspaceParams,
} from 'services/workspace';

import { UserContext } from 'store/user-context';

import { SettingSection } from './setting-section';

export const OverviewSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Workspace name must be atleast 2 characters',
    })
    .max(50),
  timezone: z.string(),
});

export const Workspace = observer(() => {
  const user = React.useContext(UserContext);
  const workspace = useWorkspace();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof OverviewSchema>>({
    resolver: zodResolver(OverviewSchema),
    defaultValues: {
      name: user.workspace.name,
      timezone: user.workspace.preferences?.timezone,
    },
  });

  const { mutate: updateWorkspace } = useUpdateWorkspaceMutation({});

  const onSubmit = (values: UpdateWorkspaceParams) => {
    updateWorkspace(
      { ...values, workspaceId: workspace.id },
      {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Workspace is updated' });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingSection
        title="Workspace"
        description="Manage all the settings for your organization"
      >
        <div className="max-w-[500px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace name</FormLabel>
                    <FormControl>
                      <Input placeholder="Tesla" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger showIcon={false}>
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Intl.supportedValuesOf('timeZone').map((timezone) => (
                          <SelectItem key={timezone} value={timezone}>
                            {timezone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="secondary"
                isLoading={form.formState.isSubmitting}
              >
                Update
              </Button>
            </form>
          </Form>
        </div>
      </SettingSection>
    </div>
  );
});
