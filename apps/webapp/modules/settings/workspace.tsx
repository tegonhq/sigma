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
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SettingSection } from './setting-section';
import React from 'react';
import { UserContext } from 'store/user-context';

export const OverviewSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Workspace name must be atleast 2 characters',
    })
    .max(50),
});

export const Workspace = observer(() => {
  const user = React.useContext(UserContext);
  const form = useForm<z.infer<typeof OverviewSchema>>({
    resolver: zodResolver(OverviewSchema),
    defaultValues: {
      name: user.workspace.name,
    },
  });

  const onSubmit = () => {};

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
