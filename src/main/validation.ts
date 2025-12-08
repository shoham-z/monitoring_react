import { z, ZodError } from 'zod';
import { MyNotification } from './util';
import { PingableEntry } from '../renderer/utils';

export const IPAddressSchema = z
  .string()
  .regex(/^(\d{1,3}\.){3}\d{1,3}$/, 'Invalid IP address format')
  .refine((ip) => {
    const parts = ip.split('.');
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }, 'IP address octets must be between 0-255');

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  message: z.string().min(1).max(500),
  timestamp: z.string(),
  color: z.enum(['white', 'red', 'yellow', 'green']),
  swId: z.number(),
});

export const SwitchListSchema = z.array(
  z.object({
    id: z.number(),
    ip: IPAddressSchema,
    name: z.string().min(1).max(50),
  }),
);

// Validation functions
export const validateIPAddress = (ip: unknown): string => {
  return IPAddressSchema.parse(ip);
};

export const validateNotification = (notification: unknown): MyNotification => {
  return NotificationSchema.parse(notification);
};

export const validateSwitchList = (list: unknown): PingableEntry[] => {
  return SwitchListSchema.parse(list);
};