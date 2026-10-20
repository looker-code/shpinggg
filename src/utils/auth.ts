import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  authMethod: 'magic_link' | 'password';
  createdAt: string;
}

const STORAGE_AUTH_USER = 'enablepay_user_profile';
const STORAGE_REGISTERED_USERS = 'enablepay_registered_users';

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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

// ============================================================================
// --- ENVIO DO LINK MÁGICO (MAGIC LINK VIA SUPABASE AUTH) ---
// ============================================================================

export const sendMagicLink = async (
  rawEmail: string,
  name?: string
): Promise<{ success: boolean; isRealEmail: boolean; message: string }> => {
  const cleanEmail = rawEmail.trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return { success: false, isRealEmail: false, message: 'Digite um endereço de e-mail válido (ex: seu@email.com).' };
  }

  // Tenta envio real via Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
        const { error } = await client.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: redirectUrl,
            data: name?.trim() ? { name: name.trim() } : undefined,
          },
        });

        if (!error) {
          return {
            success: true,
            isRealEmail: true,
            message: `Link Mágico enviado para ${cleanEmail}! Abra seu e-mail e clique no link para entrar.`,
          };
        } else {
          console.error('[EnablePay] Supabase Magic Link error:', error.message);
          return {
            success: false,
            isRealEmail: true,
            message: error.message.includes('rate limit') || error.message.includes('security')
              ? 'Por segurança, aguarde 60 segundos antes de solicitar um novo link.'
              : `Supabase: ${error.message}`,
          };
        }
      }
    } catch (err: any) {
      console.warn('[EnablePay] Erro de rede ao conectar Supabase:', err);
    }
  }

  // Fallback para modo demonstração
  return {
    success: true,
    isRealEmail: false,
    message: `Link Mágico gerado para ${cleanEmail}.`,
  };
};

export const loginWithSimulatedMagicLink = (email: string, name?: string): UserProfile => {
  const cleanEmail = email.trim().toLowerCase();
  const profile: UserProfile = {
    id: `usr_${Date.now()}`,
    name: name?.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    authMethod: 'magic_link',
    createdAt: new Date().toISOString(),
  };
  saveCurrentUser(profile);
  return profile;
};

// ============================================================================
// --- REGISTRO E LOGIN POR SENHA ---
// ============================================================================

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
  if (!cleanIdent) return { success: false, message: 'Informe seu e-mail ou usuário.' };
  if (password.length < 4) return { success: false, message: 'A senha deve ter no mínimo 4 dígitos.' };

  const users = getRegisteredUsers();
  const exists = users.find((u) => u.identifier === cleanIdent);
  if (exists) {
    return { success: false, message: 'Este usuário já está cadastrado. Faça login.' };
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
      authMethod: 'password',
      createdAt: found.createdAt,
    };
    saveCurrentUser(profile);
    return { success: true, user: profile, message: 'Login realizado com sucesso!' };
  }

  return { success: false, message: 'E-mail ou senha incorretos.' };
};
