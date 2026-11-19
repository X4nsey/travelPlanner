import { z } from 'zod';

export const updateTripShareSchema = z.object({
  isActive: z.boolean().optional(),
  showItinerary: z.boolean().optional(),
  showPackingList: z.boolean().optional(),
  showCountryInfo: z.boolean().optional(),
  showExpenses: z.boolean().optional(),
});

export type UpdateTripShareInput = z.infer<typeof updateTripShareSchema>;
