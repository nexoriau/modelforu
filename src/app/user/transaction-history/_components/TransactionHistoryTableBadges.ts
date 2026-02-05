export const getSourceBadge = (source: string) => {
  const styles: any = {
    purchase: 'bg-blue-100 text-blue-700 border-blue-200',
    subscription: 'bg-purple-100 text-purple-700 border-purple-200',
    ['admin-provided']: 'bg-green-100 text-green-700 border-green-200',
    refund: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return styles[source] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getTypeBadge = (type: string) => {
  const styles: any = {
    'One-Time': 'bg-slate-100 text-slate-700 border-slate-200',
    Subscription: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Admin Provided': 'bg-violet-100 text-violet-700 border-violet-200',
  };
  return styles[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};
