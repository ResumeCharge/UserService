import { SetMetadata } from '@nestjs/common';
import { RESOURCE } from '../guards.constants';

export const Resource = (resource: string) => SetMetadata(RESOURCE, resource);
