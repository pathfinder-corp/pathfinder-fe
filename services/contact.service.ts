import type { ICreateContactRequest, ICreateContactResponse } from '@/types';
import { api, extractErrorMessage } from '@/lib';

export const contactService = {
  createContact: async (
    data: ICreateContactRequest
  ): Promise<ICreateContactResponse> => {
    try {
      const response = await api.post<ICreateContactResponse>('/contact', data);
      return response.data;
    } catch (error) {
      console.error('Create contact failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },
};
