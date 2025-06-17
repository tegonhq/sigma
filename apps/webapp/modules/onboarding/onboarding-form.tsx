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
  inviteCode: z.string(),
});

export function OnboardingForm() {
  const { toast } = useToast();

  const { mutate: createInitialResources, isLoading } =
    useCreateInitialResourcesMutation({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (e: any) => {
        console.log(e);
        toast({
          variant: 'destructive',
          title: 'Error!',
          description:
            'We are currently an invite-only platform. If you need an invite, please contact harshith@tegon.ai.',
        });
      },
    });

  const form = useForm<z.infer<typeof OnboardingSchema>>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      fullname: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      inviteCode: '',
    },
  });

  const onSubmit = (values: CreateInitialResourcesDto) => {
    createInitialResources({
      fullname: values.fullname,
      workspaceName: values.fullname,
      timezone: values.timezone,
      inviteCode: values.inviteCode,
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

        <FormField
          control={form.control}
          name="inviteCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invite code</FormLabel>

              <FormControl>
                <Input placeholder="Invite code" className="h-9" {...field} />
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
