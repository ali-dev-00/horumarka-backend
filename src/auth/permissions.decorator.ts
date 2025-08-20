import { SetMetadata } from '@nestjs/common';
import { Permission } from '../config/permissions';

export const RequirePermissions = (...permissions: Permission[]) => SetMetadata('permissions', permissions);
