import { getSupabaseClient } from './supabase';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  businessType: string;
  createdAt: string;
}

const STORAGE_AUTH_USER = 'enablepay_user_profile';
const STORAGE_REGISTERED_USERS = 'enablepay_registered_users';

export const BUSINESS_TYPES = [
  'Varejo / Loja Física',
  'Prestação de Serviços',
  'Autônomo / Profissional Liberal',
  'Comércio de Veículos / Concessionária',
  'Construção Civil / Reformas',
  'Marcenaria / Móveis Planejados',
  'Confecção / Moda & Roupas',
  'Venda Direta / Revenda',
  'Alimentação / Restaurante / Bar',
  'Imobiliária / Corretagem',
  'Agropecuária / Agronegócio',
  'Tecnologia / Serviços Digitais',
  'Saúde / Odontologia / Estética',
  'Outro (descrever)',
] as const;

const SESSION_ACTIVE_KEY = 'enablepay_active_session';

export const getCurrentUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_USER) || sessionStorage.getItem(STORAGE_AUTH_USER);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

export const saveCurrentUser = (user: UserProfile): void => {
  try {
    sessionStorage.setItem(SESSION_ACTIVE_KEY, 'true');
    // Para usuário admin, salva apenas na sessão atual do navegador
    if (user.username === 'admin') {
      sessionStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
      localStorage.removeItem(STORAGE_AUTH_USER);
    } else {
      localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
    }
  } catch {}
};

export const logoutCurrentUser = (): void => {
  try {
    sessionStorage.removeItem(SESSION_ACTIVE_KEY);
    sessionStorage.removeItem(STORAGE_AUTH_USER);
    localStorage.removeItem(STORAGE_AUTH_USER);
    localStorage.removeItem('enablepay_auth_v1');
    localStorage.removeItem('promissory_auth_picpay_v3');
    const client = getSupabaseClient();
    if (client) {
      client.auth.signOut().catch(() => {});
    }
  } catch {}
};

export const getRegisteredUsers = (): any[] => {
  try {
    const raw = localStorage.getItem(STORAGE_REGISTERED_USERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

// ============================================================================
// --- CADASTRO DIRETO DE CONTA (SEM CONFIRMAÇÃO) ---
// ============================================================================

export const registerUser = async (data: {
  fullName: string;
  username: string;
  password: string;
  businessType: string;
  customBusinessType?: string;
}): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
  const cleanName = data.fullName.trim();
  const cleanUsername = data.username.trim().toLowerCase().replace(/\s+/g, '');
  const cleanPassword = data.password.trim();
  const cleanBusinessType = data.businessType.trim();
  const cleanCustom = data.customBusinessType?.trim();

  if (!cleanName) {
    return { success: false, message: 'Por favor, informe seu Nome Completo.' };
  }
  if (!cleanUsername) {
    return { success: false, message: 'Escolha um Nome de Usuário.' };
  }
  if (cleanUsername.length < 3) {
    return { success: false, message: 'O nome de usuário deve ter pelo menos 3 caracteres.' };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, message: 'A senha deve ter no mínimo 4 caracteres.' };
  }
  if (!cleanBusinessType) {
    return { success: false, message: 'Selecione o tipo de negócio.' };
  }
  if (cleanBusinessType === 'Outro (descrever)' && !cleanCustom) {
    return { success: false, message: 'Por favor, descreva o seu tipo de negócio no campo indicado.' };
  }

  if (cleanUsername === 'admin' || cleanUsername === 'administrador' || cleanUsername === 'root') {
    return {
      success: false,
      message: 'O nome de usuário "admin" é reservado para o acesso administrativo. Por favor, escolha outro.',
    };
  }

  const users = getRegisteredUsers();
  const exists = users.some(
    (u) =>
      (u.username && u.username.toLowerCase() === cleanUsername) ||
      (u.identifier && u.identifier.toLowerCase() === cleanUsername)
  );
  if (exists) {
    return {
      success: false,
      message: `O nome de usuário "${cleanUsername}" já está em uso. Por favor, escolha outro ou clique em Entrar.`,
    };
  }

  const finalBusinessType = cleanBusinessType === 'Outro (descrever)' ? cleanCustom! : cleanBusinessType;

  const newUserRecord = {
    id: `usr_${Date.now()}`,
    name: cleanName,
    username: cleanUsername,
    password: cleanPassword,
    businessType: finalBusinessType,
    createdAt: new Date().toISOString(),
  };

  users.push(newUserRecord);
  try {
    localStorage.setItem(STORAGE_REGISTERED_USERS, JSON.stringify(users));
  } catch {}

  const profile: UserProfile = {
    id: newUserRecord.id,
    name: newUserRecord.name,
    username: newUserRecord.username,
    businessType: newUserRecord.businessType,
    createdAt: newUserRecord.createdAt,
  };

  saveCurrentUser(profile);
  return { success: true, user: profile, message: 'Conta criada com sucesso!' };
};

// ============================================================================
// --- LOGIN DIRETO POR NOME DE USUÁRIO E SENHA ---
// ============================================================================

export const loginUser = async (
  username: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
  const cleanPassword = password.trim();

  if (!cleanUsername) {
    return { success: false, message: 'Informe seu nome de usuário.' };
  }
  if (!cleanPassword) {
    return { success: false, message: 'Informe sua senha.' };
  }

  // Acesso admin demonstrativo padrão
  if (cleanUsername === 'admin' && cleanPassword === '123456') {
    const adminUser: UserProfile = {
      id: 'admin_master',
      name: 'Administrador',
      username: 'admin',
      businessType: 'Administração Geral',
      createdAt: new Date().toISOString(),
    };
    saveCurrentUser(adminUser);
    return { success: true, user: adminUser, message: 'Acesso autorizado!' };
  }

  const users = getRegisteredUsers();
  const found = users.find(
    (u) =>
      (u.username === cleanUsername || u.identifier === cleanUsername) &&
      u.password === cleanPassword
  );

  if (found) {
    const profile: UserProfile = {
      id: found.id,
      name: found.name,
      username: found.username || cleanUsername,
      businessType: found.businessType || 'Comércio / Geral',
      createdAt: found.createdAt || new Date().toISOString(),
    };
    saveCurrentUser(profile);
    return { success: true, user: profile, message: 'Login realizado com sucesso!' };
  }

  return { success: false, message: 'Nome de usuário ou senha incorretos.' };
};
