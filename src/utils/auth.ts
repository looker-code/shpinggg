import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  authMethod: 'sms' | 'password';
  createdAt: string;
}

const STORAGE_AUTH_USER = 'enablepay_user_profile';
const STORAGE_REGISTERED_USERS = 'enablepay_registered_users';
const OTP_STORE_KEY = 'enablepay_temp_otp_store';

// Formatação brasileira de celular: (11) 99999-9999
export const formatPhoneMask = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const cleanPhoneDigits = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_USER);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

export const saveCurrentUser = (user: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
    localStorage.setItem('enablepay_auth_v1', 'true');
  } catch {}
};

export const logoutCurrentUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_AUTH_USER);
    localStorage.removeItem('enablepay_auth_v1');
    localStorage.removeItem('promissory_auth_picpay_v3');
    const client = getSupabaseClient();
    if (client) {
      client.auth.signOut().catch(() => {});
    }
  } catch {}
};

// --- Envio de Código SMS (Supabase com Fallback de Simulação Inteligente) ---

export const sendSmsOtp = async (
  rawPhone: string
): Promise<{ success: boolean; simulatedCode?: string; isRealSms: boolean; message: string }> => {
  const digits = cleanPhoneDigits(rawPhone);
  if (digits.length < 10 || digits.length > 11) {
    return { success: false, isRealSms: false, message: 'Digite um celular válido com DDD (ex: 11 99999-9999).' };
  }

  const e164Phone = `+55${digits}`;
  const generatedCode = String(Math.floor(100000 + Math.random() * 900000));

  // Salva temporariamente para validação
  try {
    const otpData = {
      phone: digits,
      code: generatedCode,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutos
    };
    sessionStorage.setItem(OTP_STORE_KEY, JSON.stringify(otpData));
  } catch {}

  // Tenta envio real via Supabase se estiver configurado
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.auth.signInWithOtp({
          phone: e164Phone,
        });

        if (!error) {
          return {
            success: true,
            isRealSms: true,
            message: `SMS enviado com sucesso para ${formatPhoneMask(digits)}!`,
          };
        }
      }
    } catch {}
  }

  // Se o provedor de SMS não estiver contratado no Supabase ainda,
  // utiliza o envio direto simulado pelo próprio sistema
  return {
    success: true,
    simulatedCode: generatedCode,
    isRealSms: false,
    message: `Código gerado pelo sistema para ${formatPhoneMask(digits)}.`,
  };
};

// --- Validação do Código SMS ---

export const verifySmsOtp = async (
  rawPhone: string,
  code: string,
  name?: string
): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
  const digits = cleanPhoneDigits(rawPhone);
  const cleanCode = code.trim();

  // 1. Tenta validação real no Supabase caso configurado
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client.auth.verifyOtp({
          phone: `+55${digits}`,
          token: cleanCode,
          type: 'sms',
        });

        if (!error && data?.user) {
          const user: UserProfile = {
            id: data.user.id || `usr_${Date.now()}`,
            name: name?.trim() || data.user.phone || `Usuário (${formatPhoneMask(digits)})`,
            phone: digits,
            authMethod: 'sms',
            createdAt: new Date().toISOString(),
          };
          saveCurrentUser(user);
          return { success: true, user, message: 'Autenticado via SMS com sucesso!' };
        }
      }
    } catch {}
  }

  // 2. Validação local do código OTP
  try {
    const raw = sessionStorage.getItem(OTP_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.phone === digits) {
        if (Date.now() > parsed.expiresAt) {
          return { success: false, message: 'Código expirado. Solicite um novo código por SMS.' };
        }
        if (parsed.code === cleanCode || cleanCode === '123456') {
          sessionStorage.removeItem(OTP_STORE_KEY);
          const user: UserProfile = {
            id: `usr_${Date.now()}`,
            name: name?.trim() || `Usuário ${digits.slice(-4)}`,
            phone: digits,
            authMethod: 'sms',
            createdAt: new Date().toISOString(),
          };
          saveCurrentUser(user);
          return { success: true, user, message: 'Autenticado com sucesso!' };
        }
      }
    }
  } catch {}

  // Código mestre de teste ou código inválido
  if (cleanCode === '123456') {
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name?.trim() || `Usuário ${digits.slice(-4)}`,
      phone: digits,
      authMethod: 'sms',
      createdAt: new Date().toISOString(),
    };
    saveCurrentUser(user);
    return { success: true, user, message: 'Autenticado com sucesso!' };
  }

  return { success: false, message: 'Código SMS incorreto. Verifique o número digitado.' };
};

// --- Registro e Login por E-mail / Senha ---

export const getRegisteredUsers = (): any[] => {
  try {
    const raw = localStorage.getItem(STORAGE_REGISTERED_USERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

export const registerWithPassword = async (
  name: string,
  emailOrPhone: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
  const cleanIdent = emailOrPhone.trim().toLowerCase();
  if (!name.trim()) return { success: false, message: 'Informe seu nome completo.' };
  if (!cleanIdent) return { success: false, message: 'Informe seu e-mail ou celular.' };
  if (password.length < 4) return { success: false, message: 'A senha deve ter no mínimo 4 dígitos.' };

  const users = getRegisteredUsers();
  const exists = users.find((u) => u.identifier === cleanIdent);
  if (exists) {
    return { success: false, message: 'Este e-mail ou celular já está cadastrado. Faça login.' };
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    identifier: cleanIdent,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_REGISTERED_USERS, JSON.stringify(users));

  const profile: UserProfile = {
    id: newUser.id,
    name: newUser.name,
    email: cleanIdent.includes('@') ? cleanIdent : undefined,
    phone: !cleanIdent.includes('@') ? cleanIdent : undefined,
    authMethod: 'password',
    createdAt: newUser.createdAt,
  };

  saveCurrentUser(profile);
  return { success: true, user: profile, message: 'Conta criada com sucesso!' };
};

export const loginWithPassword = async (
  emailOrPhone: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
  const cleanIdent = emailOrPhone.trim().toLowerCase();

  // Acesso admin padrão
  if (cleanIdent === 'admin' && password === '123456') {
    const adminUser: UserProfile = {
      id: 'admin_master',
      name: 'Administrador',
      email: 'admin@enablepay.com',
      authMethod: 'password',
      createdAt: new Date().toISOString(),
    };
    saveCurrentUser(adminUser);
    return { success: true, user: adminUser, message: 'Acesso autorizado!' };
  }

  const users = getRegisteredUsers();
  const found = users.find((u) => u.identifier === cleanIdent && u.password === password);

  if (found) {
    const profile: UserProfile = {
      id: found.id,
      name: found.name,
      email: found.identifier.includes('@') ? found.identifier : undefined,
      phone: !found.identifier.includes('@') ? found.identifier : undefined,
      authMethod: 'password',
      createdAt: found.createdAt,
    };
    saveCurrentUser(profile);
    return { success: true, user: profile, message: 'Login realizado com sucesso!' };
  }

  return { success: false, message: 'Usuário ou senha incorretos.' };
};
