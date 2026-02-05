'use client';

import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { Trash } from 'lucide-react';
import {
  SubscriptionCardSchemaType,
  subscriptionCardTableSchema,
  SubscriptionsCardTableType,
} from '@/db/schema/subscription-card';
import {
  createSubscriptionPricing,
  updateSubscriptionPricing,
} from '../_services/manageSubscriptionPricing.actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface SubscriptionFormProps {
  initialData?: SubscriptionsCardTableType;
  onClose: () => void;
}

export function ManageSubscriptionPricingForm({
  initialData,
  onClose,
}: SubscriptionFormProps) {
  const router = useRouter();

  const form = useForm<SubscriptionCardSchemaType>({
    resolver: zodResolver(
      subscriptionCardTableSchema
    ) as Resolver<SubscriptionCardSchemaType>,
    defaultValues: {
      model: initialData?.model ?? 1,
      name: initialData?.name ?? '',
      monthlyPrice: initialData?.monthlyPrice
        ? Number(initialData.monthlyPrice)
        : 0,
      annualPrice: initialData?.annualPrice
        ? Number(initialData.annualPrice)
        : 0,
      monthlyCredits: initialData?.monthlyCredits
        ? Number(initialData.monthlyCredits)
        : 0,
      annualCredits: initialData?.annualCredits
        ? Number(initialData.annualCredits)
        : 0,
      monthlyDescription: initialData?.monthlyDescription ?? '',
      annualDescription: initialData?.annualDescription ?? '',
      features: initialData?.features ?? [],
      highlighted: initialData?.highlighted ?? false,
      forAgency: initialData?.forAgency ?? false,
    },
  });

  const { fields, append, remove } = useFieldArray<any>({
    control: form.control,
    name: 'features',
  });

  const onSubmit = async (data: SubscriptionCardSchemaType) => {
    try {
      if (initialData) {
        const res = await updateSubscriptionPricing(initialData.id, data);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success('Subscription updated successfully');
      } else {
        const res = await createSubscriptionPricing(data);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success('Subscription created successfully');
      }
      router.refresh();
      onClose();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset className="space-y-6" disabled={form.formState.isSubmitting}>
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monthlyPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="annualPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monthlyCredits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Credits</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="annualCredits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Credits</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monthlyDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="annualDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Features</FormLabel>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2 mb-2">
                <FormControl>
                  <Input
                    {...form.register(`features.${index}`)}
                    placeholder={`Feature ${index + 1}`}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append('')}>
              Add Feature
            </Button>
            <FormMessage>{form.formState.errors.features?.message}</FormMessage>
          </FormItem>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="highlighted"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">
                        Highlighted
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Make this item stand out
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="forAgency"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">
                        For Agency
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark as agency-specific
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full">
            Save
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
