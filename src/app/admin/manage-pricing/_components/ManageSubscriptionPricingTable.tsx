'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SubscriptionsCardTableType } from '@/db/schema/subscription-card';
import { Pencil, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SubscriptionTableProps {
  data: SubscriptionsCardTableType[];
  onEdit: (subscription: SubscriptionsCardTableType) => void;
  onDelete: (id: string) => void;
}

export function ManageSubscriptionPricingTable({
  data,
  onEdit,
  onDelete,
}: SubscriptionTableProps) {
  const { t } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {t('admin.managePricing.subscription.table.name')}
          </TableHead>
          <TableHead>
            {' '}
            {t('admin.managePricing.subscription.table.monthlyPrice')}
          </TableHead>
          <TableHead>
            {' '}
            {t('admin.managePricing.subscription.table.annualPrice')}
          </TableHead>
          <TableHead>
            {' '}
            {t('admin.managePricing.subscription.table.highlighted')}
          </TableHead>
          <TableHead>
            {' '}
            {t('admin.managePricing.subscription.table.forAgency')}
          </TableHead>
          <TableHead>
            {' '}
            {t('admin.managePricing.subscription.table.actions')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>${row.monthlyPrice}</TableCell>
              <TableCell>${row.annualPrice}</TableCell>
              <TableCell>{row.highlighted ? 'Yes' : 'No'}</TableCell>
              <TableCell>{row.forAgency ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(row)}
                  >
                    <Pencil className="h-2 w-2" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(row.id)}
                  >
                    <Trash className="h-2 w-2" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              {t('admin.managePricing.subscription.table.noResults')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
