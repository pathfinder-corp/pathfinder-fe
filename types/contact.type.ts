export type ContactType = 'general' | 'suspended' | 'feedback' | 'support';
export type ContactStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface IContactUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}

export interface IContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  type: ContactType;
  userId?: string;
  user?: IContactUser;
  status: ContactStatus;
  adminResponse?: string;
  respondedAt?: string;
  respondedBy?: string;
  respondedByUser?: IContactUser;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateContactRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  type?: ContactType;
}

export interface ICreateContactResponse {
  message: string;
  contactMessage: IContactMessage;
}
