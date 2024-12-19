import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useToast,
  Input,
  Button,
} from '@tegonhq/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  useCreateInitialResourcesMutation,
  type CreateInitialResourcesDto,
} from 'services/workspace';

export const OnboardingSchema = z.object({
  fullname: z.string().min(5),
  workspaceName: z.string().min(3),
});

export function OnboardingForm() {
  const { toast } = useToast();

  const { mutate: createInitialResources, isLoading } =
    useCreateInitialResourcesMutation({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (e: any) => {
        toast({
          variant: 'destructive',
          title: 'Error!',
          description: e.message,
        });
      },
    });

  const form = useForm<z.infer<typeof OnboardingSchema>>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      fullname: '',
      workspaceName: '',
    },
  });

  const onSubmit = (values: CreateInitialResourcesDto) => {
    createInitialResources(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Full name" className="h-9" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="workspaceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace name</FormLabel>
              <FormControl>
                <Input placeholder="Tegon" className="h-9" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            className="flex gap-2"
            size="xl"
            isLoading={isLoading}
            type="submit"
            variant="secondary"
          >
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
