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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@redplanethq/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  useCreateInitialResourcesMutation,
  type CreateInitialResourcesDto,
} from 'services/workspace';

export const OnboardingSchema = z.object({
  fullname: z.string().min(5),
  timezone: z.string().min(5),
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
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const onSubmit = (values: CreateInitialResourcesDto) => {
    createInitialResources({
      fullname: values.fullname,
      workspaceName: values.fullname,
      timezone: values.timezone,
    });
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
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
