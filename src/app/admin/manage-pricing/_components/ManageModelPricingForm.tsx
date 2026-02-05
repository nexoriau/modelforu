// components/model-card-form.tsx
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
  modelCardSchema,
  modelCardSchemaType,
  ModelCardTableType,
} from '@/db/schema/model-card';
import {
  createModelCard,
  updateModelCard,
} from '../_services/manageModelPricing.action';
import { toast } from 'sonner';

interface ModelCardFormProps {
  initialData?: ModelCardTableType;
  onClose: () => void;
}

export function ModelCardForm({ initialData, onClose }: ModelCardFormProps) {
  const router = useRouter();

  const form = useForm<modelCardSchemaType>({
    resolver: zodResolver(modelCardSchema),
    defaultValues: initialData
      ? {
          ...initialData,
        }
      : {
          name: '',
          price: '0',
          quantity: 0,
        },
  });

  const onSubmit = async (data: modelCardSchemaType) => {
    try {
      if (initialData) {
        await updateModelCard(initialData.id, data);
        toast.success('Model Card updated successfully');
      } else {
        await createModelCard(data);
        toast.success('Model Card created successfully');
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
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
