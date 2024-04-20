import { SetMetadata } from '@nestjs/common';
import { RESOURCE_ID } from '../guards.constants';

export const ResourceId = (resourceId: string) =>
  SetMetadata(RESOURCE_ID, resourceId);
