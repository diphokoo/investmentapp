import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || url === 'https://your-project.supabase.co') {
  throw new Error('[Supabase] EXPO_PUBLIC_SUPABASE_URL is not set. Check your .env file.');
}
if (!key || key === 'your-anon-key') {
  throw new Error('[Supabase] EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. Check your .env file.');
}

// This project uses custom database-backed customer sessions, not Supabase Auth.
export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

// ── Types ────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  first_name: string | null;
  last_name: string | null;
  id_number: string | null;
  kyc_status: string;
  is_active: boolean;
  credit_limit: number;
  language: string;
  appearance: string;
  notifications_enabled: boolean;
  created_at: string;
  employee_number: string | null;
  monthly_salary: number | null; // cents
  pay_day: number | null;
  employer_industry: string | null;
  date_of_birth: string | null;
}

interface StoredAuthSession {
  access_token: string;
  refresh_token: string;
  access_expires_at: number;
}

interface AuthRpcResponse {
  success?: boolean;
  error?: string;
  user?: AppUser;
  access_token?: string;
  refresh_token?: string;
  access_expires_in?: number;
}

const SESSION_KEY = 'zari_customer_session';

async function saveSession(session: StoredAuthSession): Promise<void> {
  const value = JSON.stringify(session);
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') throw new Error('Browser storage is unavailable.');
    // Web fallback only. For production web, prefer server-set HttpOnly cookies.
    window.sessionStorage.setItem(SESSION_KEY, value);
  } else {
    await SecureStore.setItemAsync(SESSION_KEY, value);
  }
}

async function loadSession(): Promise<StoredAuthSession | null> {
  let value: string | null;
  if (Platform.OS === 'web') {
    value = typeof window === 'undefined' ? null : window.sessionStorage.getItem(SESSION_KEY);
  } else {
    value = await SecureStore.getItemAsync(SESSION_KEY);
  }
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as StoredAuthSession;
    if (!parsed.access_token || !parsed.refresh_token || !Number.isFinite(parsed.access_expires_at)) {
      await clearSession();
      return null;
    }
    return parsed;
  } catch {
    await clearSession();
    return null;
  }
}

async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

let refreshPromise: Promise<StoredAuthSession> | null = null;

function rpcError(data: any, fallback: string): string | null {
  if (!data) return fallback;
  if (data.success === false || data.error) return String(data.error ?? fallback);
  return null;
}

async function rotateSession(): Promise<StoredAuthSession> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const current = await loadSession();
    if (!current?.refresh_token) throw new Error('Your session has expired. Please sign in again.');

    const { data, error } = await supabase.rpc('refresh_customer_session', {
      p_refresh_token: current.refresh_token,
    });
    if (error) throw new Error(error.message);

    const result = data as AuthRpcResponse;
    const failure = rpcError(result, 'Your session has expired. Please sign in again.');
    if (failure) throw new Error(failure);
    if (!result?.access_token || !result.refresh_token) {
      throw new Error('The server returned an invalid session. Please sign in again.');
    }

    const next: StoredAuthSession = {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      access_expires_at: Date.now() + (Number(result.access_expires_in) || 600) * 1000,
    };
    await saveSession(next);
    return next;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function getValidAccessToken(): Promise<string> {
  const session = await loadSession();
  if (!session) throw new Error('You are not signed in.');
  if (session.access_expires_at <= Date.now() + 60_000) {
    return (await rotateSession()).access_token;
  }
  return session.access_token;
}

// ── Registration ─────────────────────────────────────────────────────────────

export async function registerCustomer(params: {
  email: string; phone: string; password: string;
  firstName: string; lastName: string; idNumber: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc('register_customer', {
    p_email: params.email,
    p_phone: params.phone,
    p_password: params.password,
    p_first_name: params.firstName,
    p_last_name: params.lastName,
    p_id_number: params.idNumber,
  });
  if (error) {
    if (error.message.includes('EMAIL_EXISTS')) throw new Error('An account with this email address already exists.');
    if (error.message.includes('ID_EXISTS')) throw new Error('An account with this ID number already exists.');
    throw new Error(error.message);
  }
  return data as string;
}

// ── Authentication ───────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<AppUser> {
  const { data, error } = await supabase.rpc('login_customer', {
    p_email: email.trim().toLowerCase(),
    p_password: password,
  });
  if (error) throw new Error(error.message);

  // login_customer currently returns a flat JSON object: user columns and
  // token fields are at the same level. Accept that format, while remaining
  // compatible with a nested { user, access_token, refresh_token } response.
  const result = data as (AuthRpcResponse & Partial<AppUser>);
  const failure = rpcError(result, 'Incorrect email or password. Please try again.');
  if (failure) {
    throw new Error(failure.toUpperCase().includes('INVALID_CREDENTIALS')
      ? 'Incorrect email or password. Please try again.' : failure);
  }

  if (!result?.access_token || !result.refresh_token) {
    throw new Error('Sign in failed: the server returned an incomplete session.');
  }

  const {
    access_token,
    refresh_token,
    access_expires_in,
    user: nestedUser,
    ...flatUser
  } = result;

  const user = (nestedUser ?? flatUser) as AppUser;
  if (!user?.id || !user?.email) {
    throw new Error('Sign in failed: the server returned an incomplete customer profile.');
  }

  await saveSession({
    access_token,
    refresh_token,
    access_expires_at: Date.now() + (Number(access_expires_in) || 600) * 1000,
  });
  return user;
}

export async function restoreCustomerSession(): Promise<AppUser | null> {
  const existing = await loadSession();
  if (!existing) return null;

  try {
    const refreshed = await rotateSession();
    const { data, error } = await supabase.rpc('get_customer_profile', {
      p_access_token: refreshed.access_token,
    });
    if (error) throw new Error(error.message);

    const result = data as any;
    const failure = rpcError(result, 'Your session is no longer valid.');
    if (failure) throw new Error(failure);

    const user = (result?.user ?? result) as AppUser;
    if (!user?.id || !user?.email) throw new Error('The server returned an invalid customer profile.');
    return user;
  } catch (err: any) {
    const message = String(err?.message ?? '').toLowerCase();
    const invalidSession = ['invalid', 'expired', 'revoked', 'session_not_found', 'not signed in']
      .some(term => message.includes(term));
    // Preserve tokens on transient network/server failures.
    if (invalidSession) await clearSession();
    throw err;
  }
}

export async function updateCustomerProfile(
  updates: Partial<Pick<AppUser,
    'first_name' | 'last_name' | 'email' | 'phone'
  >>,
): Promise<AppUser> {
  const accessToken = await getValidAccessToken();

  // The current database function accepts exactly these five parameters.
  // Language, appearance and notification preferences will be wired up
  // separately once the database supports persisting them.
  const { data, error } = await supabase.rpc('update_customer_profile', {
    p_access_token: accessToken,
    p_first_name: updates.first_name ?? null,
    p_last_name: updates.last_name ?? null,
    p_email: updates.email ?? null,
    p_phone: updates.phone ?? null,
  });
  if (error) throw new Error(error.message);

  const result = data as any;
  const failure = rpcError(result, 'Your profile could not be updated.');
  if (failure) throw new Error(failure);
  const user = (result?.user ?? result) as AppUser;
  if (!user?.id) throw new Error('The server returned an invalid profile.');
  return user;
}

export async function signOut(): Promise<void> {
  try {
    const session = await loadSession();
    if (session?.refresh_token) {
      await supabase.rpc('logout_customer', { p_refresh_token: session.refresh_token });
    }
  } finally {
    await clearSession();
  }
}

// ── Dashboard Data ───────────────────────────────────────────────────────────

export interface LoanRecord {
  id: string;
  status: string;
  requested_amount: number;
  approved_amount: number | null;
  outstanding_balance: number;
  due_date: string | null;
  submitted_at: string | null;
  created_at: string;
}

export interface DashboardData {
  availableCredit: number;
  outstanding: number;
  nextDueDate: string | null;
  recentLoans: LoanRecord[];
}

export async function fetchDashboardData(userId: string, creditLimitCents: number): Promise<DashboardData> {
  // SECURITY TODO: this legacy RPC trusts a client-supplied user ID.
  // Replace it with a token-validating RPC before production.
  const { data, error } = await supabase.rpc('fetch_user_loans', { p_user_id: userId });
  if (error) throw new Error(error.message);

  const loans: LoanRecord[] = data ?? [];
  const activeLoans = loans.filter(loan => ['active', 'approved', 'disbursed'].includes(loan.status));
  const totalOutstandingCents = activeLoans.reduce((sum, loan) => sum + (loan.outstanding_balance ?? 0), 0);
  const availableCreditCents = Math.max(0, creditLimitCents - totalOutstandingCents);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingDates = activeLoans
    .filter(loan => loan.due_date && loan.outstanding_balance > 0)
    .map(loan => new Date(loan.due_date as string))
    .filter(date => date >= today)
    .sort((a, b) => a.getTime() - b.getTime());

  const nextDueDateRaw = upcomingDates[0] ?? null;
  const nextDueDate = nextDueDateRaw
    ? nextDueDateRaw.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return {
    availableCredit: availableCreditCents / 100,
    outstanding: totalOutstandingCents / 100,
    nextDueDate,
    recentLoans: loans.slice(0, 5),
  };
}

// ── Employers / Loan Application ──────────────────────────────────────────────

export interface Employer {
  id: string;
  name: string;
  industry: string;
}

export async function fetchEmployers(): Promise<Employer[]> {
  const { data, error } = await supabase
    .from('employers')
    .select('id, name, industry')
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as Employer[];
}

export interface StagedDocument {
  documentType: DocumentType;
  fileUri: string;
  fileName: string;
  mimeType: string;
}

export interface ConsentRecord {
  type: string;
  version: string;
  text: string;
}

export async function uploadStagedDocument(params: {
  userId: string;
  doc: StagedDocument;
}): Promise<{ file_url: string; file_name: string; mime_type: string; document_type: string }> {
  const bucket = 'zaris-documents';
  const storagePath = `${params.userId}/loans/${params.doc.documentType}_${Date.now()}_${params.doc.fileName}`;
  let uploadData: Uint8Array | Blob;

  if (Platform.OS === 'web') {
    const response = await fetch(params.doc.fileUri);
    if (!response.ok) throw new Error('Could not read the selected document.');
    uploadData = await response.blob();
  } else {
    const FileSystem = await import('expo-file-system/legacy');
    const base64 = await FileSystem.readAsStringAsync(params.doc.fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    uploadData = Buffer.from(base64, 'base64');
  }

  const { error: storageError } = await supabase.storage.from(bucket).upload(storagePath, uploadData, {
    contentType: params.doc.mimeType, upsert: true,
  });
  if (storageError) throw new Error(`Upload failed: ${storageError.message}`);

  const { data: signedData, error: signedError } = await supabase.storage
    .from(bucket).createSignedUrl(storagePath, 60 * 60 * 24 * 365 * 10);
  if (signedError || !signedData?.signedUrl) {
    throw new Error(`Could not generate file URL: ${signedError?.message}`);
  }

  return {
    file_url: signedData.signedUrl,
    file_name: params.doc.fileName,
    mime_type: params.doc.mimeType,
    document_type: params.doc.documentType,
  };
}

export async function submitLoanApplication(params: {
  userId: string;
  employerId: string;
  requestedAmount: number;
  totalRepayable: number;
  interestRateBps: number;
  termDays: number;
  dueDate: string;
  purpose: string;
  isGreenLoan: boolean;
  employeeNumber: string;
  monthlySalary: number;
  payDay: number;
  signature: string;
  consents: ConsentRecord[];
  stagedDocs: StagedDocument[];
  onProgress?: (msg: string) => void;
}): Promise<string> {
  params.onProgress?.('Uploading documents…');

  const uploadedDocs: { file_url: string; file_name: string; mime_type: string; document_type: string }[] = [];
  const uploadedPaths: string[] = [];

  try {
    for (const doc of params.stagedDocs) {
      const result = await uploadStagedDocument({ userId: params.userId, doc });
      uploadedDocs.push(result);
      // Track the exact object path returned by the upload helper.
      const fileName = result.file_name;
      uploadedPaths.push(`${params.userId}/loans/${result.document_type}_${fileName}`);
    }
  } catch (err) {
    for (const path of uploadedPaths) {
      await supabase.storage.from('zaris-documents').remove([path]).catch(() => {});
    }
    throw err;
  }

  params.onProgress?.('Saving application…');

  // SECURITY TODO: this legacy RPC trusts p_user_id. It must validate the
  // custom access token and derive the customer ID inside the database.
  const { data, error } = await supabase.rpc('submit_loan_application', {
    p_user_id: params.userId,
    p_employer_id: params.employerId,
    p_requested_amount: params.requestedAmount,
    p_total_repayable: params.totalRepayable,
    p_interest_rate_bps: params.interestRateBps,
    p_term_days: params.termDays,
    p_due_date: params.dueDate,
    p_purpose: params.purpose,
    p_is_green_loan: params.isGreenLoan,
    p_employee_number: params.employeeNumber,
    p_monthly_salary: params.monthlySalary,
    p_pay_day: params.payDay,
    p_signature: params.signature,
    p_consents: params.consents,
    p_documents: uploadedDocs,
  });

  if (error) {
    for (const path of uploadedPaths) {
      await supabase.storage.from('zaris-documents').remove([path]).catch(() => {});
    }
    if (error.message.includes('DUPLICATE_SUBMISSION')) {
      throw new Error('A submission is already in progress. Please wait a moment and try again.');
    }
    throw new Error(error.message);
  }
  return data as string;
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
  userId: string;
  documentType: DocumentType;
  fileUri: string;
  fileName: string;
  mimeType: string;
  isRequired: boolean;
}): Promise<string> {
  const bucket = 'zaris-documents';
  const storagePath = `${params.userId}/${params.documentType}_${Date.now()}_${params.fileName}`;
  let uploadData: Uint8Array | Blob;

  if (Platform.OS === 'web') {
    const response = await fetch(params.fileUri);
    if (!response.ok) throw new Error('Could not read the selected document.');
    uploadData = await response.blob();
  } else {
    const FileSystem = await import('expo-file-system/legacy');
    const base64 = await FileSystem.readAsStringAsync(params.fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    uploadData = Buffer.from(base64, 'base64');
  }

  const { error: storageError } = await supabase.storage.from(bucket).upload(storagePath, uploadData, {
    contentType: params.mimeType, upsert: true,
  });
  if (storageError) throw new Error(`Upload failed: ${storageError.message}`);

  const { data: signedData, error: signedError } = await supabase.storage
    .from(bucket).createSignedUrl(storagePath, 60 * 60 * 24 * 365 * 10);
  if (signedError || !signedData?.signedUrl) {
    throw new Error(`Could not generate file URL: ${signedError?.message}`);
  }

  const { data: docId, error: dbError } = await supabase.rpc('insert_fica_document', {
    p_user_id: params.userId,
    p_document_type: params.documentType,
    p_file_name: params.fileName,
    p_file_url: signedData.signedUrl,
    p_mime_type: params.mimeType,
    p_is_required: params.isRequired,
  });
  if (dbError) throw new Error(`Document record failed: ${dbError.message}`);
  return docId as string;
}
