export const parseCloudinaryUrl = (url: any) => {
  const defaults = {
    cut: { start: 0, end: 0 },
    crop: { width: null, height: null, x: null, y: null },
  };

  if (!url || !url.includes('/upload/')) return defaults;

  const parts = url.split('/upload/')[1].split('/');
  // The first part usually contains the transformations
  const transformString = parts[0];

  if (transformString.includes('v1')) return defaults; // No transformations found

  const transforms = transformString.split(',');

  transforms.forEach((t: any) => {
    if (t.startsWith('so_')) defaults.cut.start = t.replace('so_', '');
    if (t.startsWith('eo_')) defaults.cut.end = t.replace('eo_', '');
    if (t.startsWith('w_')) defaults.crop.width = t.replace('w_', '');
    if (t.startsWith('h_')) defaults.crop.height = t.replace('h_', '');
    if (t.startsWith('x_')) defaults.crop.x = t.replace('x_', '');
    if (t.startsWith('y_')) defaults.crop.y = t.replace('y_', '');
  });

  return defaults;
};
