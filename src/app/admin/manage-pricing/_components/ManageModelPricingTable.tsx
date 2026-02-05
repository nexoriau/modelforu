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
import { ModelCardTableType } from '@/db/schema/model-card';
import { Pencil, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ModelCardTableProps {
  data: ModelCardTableType[];
  onEdit: (modelCard: ModelCardTableType) => void;
  onDelete: (id: string) => void;
}

export function ModelCardTable({
  data,
  onEdit,
  onDelete,
}: ModelCardTableProps) {
  const { t } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('admin.managePricing.models.table.name')}</TableHead>
          <TableHead>{t('admin.managePricing.models.table.price')}</TableHead>
          <TableHead>
            {t('admin.managePricing.models.table.quantity')}
          </TableHead>
          <TableHead>{t('admin.managePricing.models.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>${row.price}</TableCell>
              <TableCell>{row.quantity}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
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
            <TableCell colSpan={4} className="h-24 text-center">
              {t('admin.managePricing.models.table.noResults')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
