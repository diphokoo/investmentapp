import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || url === 'https://your-project.supabase.co') {
  throw new Error(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL is not set.\n' +
    'Open .env and replace the placeholder with your real Supabase project URL.',
  );
}
if (!key || key === 'your-anon-key') {
  throw new Error(
    '[Supabase] EXPO_PUBLIC_SUPABASE_ANON_KEY is not set.\n' +
    'Open .env and replace the placeholder with your real Supabase anon key.',
  );
}

export const supabase = createClient(url, key);

// ── Types ────────────────────────────────────────────────────────────────────

export interface AppUser {
  id:                    string;
  email:                 string;
  phone:                 string | null;
  role:                  string;
  first_name:            string | null;
  last_name:             string | null;
  id_number:             string | null;
  kyc_status:            string;
  is_active:             boolean;
  credit_limit:          number;
  language:              string;
  appearance:            string;
  notifications_enabled: boolean;
  created_at:            string;
}

// ── Registration ─────────────────────────────────────────────────────────────

export async function registerCustomer(params: {
  email:     string;
  phone:     string;
  password:  string;
  firstName: string;
  lastName:  string;
  idNumber:  string;
}): Promise<string> {
  const { data, error } = await supabase.rpc('register_customer', {
    p_email:      params.email,
    p_phone:      params.phone,
    p_password:   params.password,
    p_first_name: params.firstName,
    p_last_name:  params.lastName,
    p_id_number:  params.idNumber,
  });

  if (error) {
    if (error.message.includes('EMAIL_EXISTS'))
      throw new Error('An account with this email address already exists.');
    if (error.message.includes('ID_EXISTS'))
      throw new Error('An account with this ID number already exists.');
    throw new Error(error.message);
  }

  return data as string;
}

// ── Authentication ────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<AppUser> {
  const { data, error } = await supabase.rpc('login_customer', {
    p_email:    email,
    p_password: password,
  });

  if (error || !data) {
    if (error?.message.includes('INVALID_CREDENTIALS') || !data)
      throw new Error('Incorrect email or password. Please try again.');
    throw new Error(error?.message ?? 'Sign in failed.');
  }

  return data as AppUser;
}

// ── Dashboard Data ───────────────────────────────────────────────────────────

export interface LoanRecord {
  id:                  string;
  status:              string;
  requested_amount:    number;
  approved_amount:     number | null;
  outstanding_balance: number;
  due_date:            string | null;
  submitted_at:        string | null;
  created_at:          string;
}

export interface DashboardData {
  availableCredit: number;   // rands (not cents)
  outstanding:     number;   // rands
  nextDueDate:     string | null;
  recentLoans:     LoanRecord[];
}

export async function fetchDashboardData(userId: string, creditLimitCents: number): Promise<DashboardData> {
  // Use security-definer RPC to bypass RLS (custom auth — auth.uid() is null)
  const { data, error } = await supabase.rpc('fetch_user_loans', { p_user_id: userId });

  if (error) throw new Error(error.message);

  const loans: LoanRecord[] = data ?? [];

  const ACTIVE = ['active', 'approved', 'disbursed'];
  const activeLoans = loans.filter(l => ACTIVE.includes(l.status));

  const totalOutstandingCents = activeLoans.reduce((sum, l) => sum + (l.outstanding_balance ?? 0), 0);
  const availableCreditCents  = Math.max(0, creditLimitCents - totalOutstandingCents);

  // Next due date: earliest future due_date among active loans with outstanding balance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingDates = activeLoans
    .filter(l => l.due_date && l.outstanding_balance > 0)
    .map(l => new Date(l.due_date!))
    .filter(d => d >= today)
    .sort((a, b) => a.getTime() - b.getTime());

  const nextDueDateRaw = upcomingDates[0] ?? null;
  const nextDueDate = nextDueDateRaw
    ? nextDueDateRaw.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return {
    availableCredit: availableCreditCents / 100,
    outstanding:     totalOutstandingCents / 100,
    nextDueDate,
    recentLoans:     loans.slice(0, 5),
  };
}

export async function signOut(): Promise<void> {
  // Clear the stored session from the client
  await supabase.auth.signOut().catch(() => {});
}

// ── Document Upload ───────────────────────────────────────────────────────────

export type DocumentType =
  | 'sa_id'
  | 'proof_of_residence'
  | 'payslip'
  | 'bank_statement'
  | 'employment_letter'
  | 'selfie'
  | 'other';

export async function uploadDocument(params: {
  userId:       string;
  documentType: DocumentType;
  fileUri:      string;
  fileName:     string;
  mimeType:     string;
  isRequired:   boolean;
}): Promise<string> {
  const BUCKET      = 'zaris-documents';
  const storagePath = `${params.userId}/${params.documentType}_${Date.now()}_${params.fileName}`;

  let uploadData: Uint8Array | Blob;

  if (Platform.OS === 'web') {
    // On web the fileUri is an object URL — fetch it as a Blob directly
    const response = await fetch(params.fileUri);
    uploadData = await response.blob();
  } else {
    // On native, read via expo-file-system and decode base64 with Buffer
    const FileSystem = await import('expo-file-system/legacy');
    const base64 = await FileSystem.readAsStringAsync(params.fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    uploadData = Buffer.from(base64, 'base64');
  }

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, uploadData, { contentType: params.mimeType, upsert: true });

  if (storageError) throw new Error(`Upload failed: ${storageError.message}`);

  // Bucket is private — generate a long-lived signed URL (10 years)
  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365 * 10);

  if (signedError || !signedData?.signedUrl)
    throw new Error(`Could not generate file URL: ${signedError?.message}`);

  const fileUrl = signedData.signedUrl;

  const { data: docId, error: dbError } = await supabase.rpc('insert_fica_document', {
    p_user_id:       params.userId,
    p_document_type: params.documentType,
    p_file_name:     params.fileName,
    p_file_url:      fileUrl,
    p_mime_type:     params.mimeType,
    p_is_required:   params.isRequired,
  });

  if (dbError) throw new Error(`Document record failed: ${dbError.message}`);

  return docId as string;
}
