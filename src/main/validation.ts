import { z } from 'zod';
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

const ipAddressWithPortSchema = z.string().regex(
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
  "Invalid IP address and port format. Expected format: 'ip.address.here:port'"
);

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

export const VarsSchema = z.object({
  SERVER_IP: ipAddressWithPortSchema,
  MODE: z.enum(['SWITCH', 'ENCRYPTOR']),
  MAX_MISSED_PINGS: z.number().min(1).max(10)
});

export const NotificationParamsSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
});

export const NotificationsArraySchema = z.array(NotificationSchema);

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

export const validateSwitchListResponse = (response: unknown) => {
  return SwitchListSchema.parse(response);
};

export const validateVarsResponse = (response: unknown) => {
  return VarsSchema.parse(response);
};

export const validateNotificationParams = (params: unknown) => {
  return NotificationParamsSchema.parse(params);
};

export const validateNotificationsResponse = (response: unknown) => {
  return NotificationsArraySchema.parse(response);
};