// components/payment-card-form.tsx
'use client';

import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  paymentCardSchema,
  paymentCardSchemaType,
  PaymentCardTableType,
} from '@/db/schema/payment-card';
import {
  createPaymentCard,
  updatePaymentCard,
} from '../_services/managePaymentPricing.action';
import { toast } from 'sonner';

interface PaymentCardFormProps {
  initialData?: PaymentCardTableType;
  onClose: () => void;
}

export function PaymentCardForm({
  initialData,
  onClose,
}: PaymentCardFormProps) {
  const router = useRouter();

  const form = useForm<paymentCardSchemaType>({
    resolver: zodResolver(paymentCardSchema),
    defaultValues: initialData
      ? {
          ...initialData,
        }
      : {
          name: '',
          price: '0',
          credits: 0,
        },
  });

  const onSubmit = async (data: paymentCardSchemaType) => {
    try {
      if (initialData) {
        await updatePaymentCard(initialData.id, data);
        toast.success('Payment Card updated successfully');
      } else {
        await createPaymentCard(data);
        toast.success('Payment Card created successfully');
      }
      router.refresh();
      onClose();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong at pricing card form');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={form.formState.isSubmitting} className="space-y-6">
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toString())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="credits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credits</FormLabel>
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
          <Button type="submit" className="w-full">
            Save
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
