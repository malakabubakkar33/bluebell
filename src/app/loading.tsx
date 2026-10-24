import React from 'react';
import { BlueDotLoader } from '@/components/common/BlueDotLoader';

export default function Loading() {
  return <BlueDotLoader fullScreen={true} label="Loading Page..." size="md" />;
}
