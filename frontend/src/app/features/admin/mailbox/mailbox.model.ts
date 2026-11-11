export interface MailAddress {
  name: string | null;
  email: string;
}

export type FolderRole = 'inbox' | 'sent' | 'trash' | 'archive' | 'junk' | 'drafts' | null;

export type MailAction = 'open' | 'read' | 'unread' | 'archive' | 'move' | 'spam' | 'inbox' | 'delete';

export interface MailFolder {
  path: string;
  name: string;
  role: FolderRole;
  total: number;
  unread: number | null;
}

export interface MailSummary {
  uid: number;
  subject: string;
  from: MailAddress | null;
  to: MailAddress[];
  date: string | null;
  seen: boolean;
}

export interface MailAttachment {
  index: number;
  name: string;
  type: string;
  size: number;
}

export interface MailMessage extends MailSummary {
  cc: MailAddress[];
  reply_to: MailAddress[];
  message_id: string | null;
  references: string | null;
  text: string | null;
  html: string | null;
  attachments: MailAttachment[];
}

export interface ComposeData {
  to?: string;
  cc?: string;
  subject?: string;
  body?: string;
  inReplyTo?: string | null;
  references?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  sent: 'Poslato',
  trash: 'Otpad',
  archive: 'Arhiva',
  junk: 'Neželjeno',
  drafts: 'Nacrti',
};

const FOLDER_LABELS: Record<string, string> = {
  INBOX: 'Primljeno',
  sent: 'Poslato',
  'sent messages': 'Poslato',
  'sent items': 'Poslato',
  drafts: 'Nacrti',
  trash: 'Otpad',
  junk: 'Neželjeno',
  spam: 'Spam (filter servera)',
  archive: 'Arhiva',
};

export function folderLabel(folder: MailFolder): string {
  if (folder.path === 'INBOX') {
    return FOLDER_LABELS['INBOX'];
  }
  if (folder.role && ROLE_LABELS[folder.role] && folder.name.toLowerCase() !== 'spam') {
    return ROLE_LABELS[folder.role];
  }
  return FOLDER_LABELS[folder.name.toLowerCase()] ?? folder.name;
}

export function addressLabel(address: MailAddress | null): string {
  return address ? address.name || address.email : '—';
}

export function addressList(addresses: MailAddress[]): string {
  return addresses.map((address) => (address.name ? `${address.name} <${address.email}>` : address.email)).join(', ');
}

export function fileSize(bytes: number): string {
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function mailDate(value: string | null): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString('sr-Latn-RS', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'numeric', year: 'numeric' });
}
