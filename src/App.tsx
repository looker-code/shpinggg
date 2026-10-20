import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DebtAccount, PaymentMethod } from './types';
import { 
  loadAccounts, 
  saveAccounts, 
  calculateAccountFinancials, 
  calculateDashboardSummary,
  generateInstallments,
  distributePayment,
  recalculateAccountFromPayments,
  formatCurrency,
  isSeedAccount,
  getAdminDemoAccount
} from './utils/storage';
import {
  isSupabaseConfigured,
  getSupabaseClient,
  fetchAccountsFromSupabase,
  saveAccountToSupabase,
  deleteAccountFromSupabase
} from './utils/supabase';
import { getCurrentUser, saveCurrentUser, logoutCurrentUser, UserProfile } from './utils/auth';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { AccountsPayableTab } from './components/AccountsPayableTab';
import { NewAccountModal } from './components/NewAccountModal';
import { AddPaymentModal } from './components/AddPaymentModal';
import { PromissoryDetailsModal } from './components/PromissoryDetailsModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('enablepay_active_session') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return getCurrentUser();
  });

  // No acesso administrativo (admin), dados são mantidos APENAS no navegador local do usuário
  const canSyncWithSupabase = isSupabaseConfigured() && currentUser?.username !== 'admin';

  const [activeTab, setActiveTab] = useState<'inicio' | 'a-pagar'>('inicio');

  const [accounts, setAccounts] = useState<DebtAccount[]>(() => {
    const loaded = loadAccounts();
    const user = getCurrentUser();
    if (user?.username === 'admin' && loaded.length === 0) {
      return [getAdminDemoAccount()];
    }
    return loaded;
  });

  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [selectedAccountForPayment, setSelectedAccountForPayment] = useState<DebtAccount | null>(null);
  const [selectedAccountForDetails, setSelectedAccountForDetails] = useState<DebtAccount | null>(null);
  const [isGlobalPaymentModalOpen, setIsGlobalPaymentModalOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  // Sincronização automática com Supabase (apenas para contas normais; admin não salva na DB)
  useEffect(() => {
    if (canSyncWithSupabase) {
      fetchAccountsFromSupabase()
        .then((dbAccounts) => {
          if (Array.isArray(dbAccounts)) {
            setAccounts(dbAccounts);
            saveAccounts(dbAccounts);
            console.log(`[EnablePay] Conectado ao Supabase! ${dbAccounts.length} contas carregadas.`);
          }
        })
        .catch((err) => {
          console.error('[EnablePay] Erro ao sincronizar do Supabase:', err);
        });
    }
  }, [canSyncWithSupabase]);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const handleLogin = (user?: UserProfile) => {
    sessionStorage.setItem('enablepay_active_session', 'true');
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(getCurrentUser());
    }
    setIsAuthenticated(true);
    if (user?.username === 'admin') {
      const current = loadAccounts();
      if (current.length === 0) {
        const demo = [getAdminDemoAccount()];
        setAccounts(demo);
        saveAccounts(demo);
      }
      showToast('Acesso administrativo ativado. Cliente exemplo carregado localmente.', 'info');
    } else {
      showToast(`Acesso autorizado! Bem-vindo, ${user?.name || 'Administrador'}.`);
    }
  };

  const handleLogout = () => {
    logoutCurrentUser();
    sessionStorage.removeItem('enablepay_active_session');
    setCurrentUser(null);
    setIsAuthenticated(false);
    showToast('Sessão finalizada com sucesso.', 'info');
  };

  // Gerador de código sequencial
  const getNextCodeSuggestion = () => {
    const existingNumbers = accounts.map((a) => {
      const match = a.code.match(/CT-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers, 0) : 0;
    const nextNum = maxNum + 1;
    return `CT-${String(nextNum).padStart(3, '0')}`;
  };

  // Cadastro de nova conta com parcelamento automático
  const handleCreateAccount = (accountData: {
    debtorName: string;
    debts: { id: string; name: string; amount: number }[];
    totalAmount: number;
    installmentValue: number;
    notes?: string;
  }) => {
    const generated = generateInstallments(accountData.totalAmount, accountData.installmentValue);

    const newAccount: DebtAccount = {
      id: `acc_${Date.now()}`,
      code: getNextCodeSuggestion(),
      debtorName: accountData.debtorName,
      debts: accountData.debts,
      totalAmount: accountData.totalAmount,
      installmentValue: accountData.installmentValue,
      installments: generated,
      payments: [],
      status: 'em_aberto',
      createdAt: new Date().toISOString(),
      notes: accountData.notes,
    };

    setAccounts((prev) => [newAccount, ...prev]);
    if (canSyncWithSupabase) {
      saveAccountToSupabase(newAccount).catch((err) => console.error(err));
    }
    showToast(`Conta de ${newAccount.debtorName} cadastrada em ${generated.length}x!`);
  };

  // Adicionar pagamento com amortização nas últimas parcelas
  const handleAddPayment = (
    accountId: string,
    paymentData: { 
      amount: number; 
      date: string; 
      method: PaymentMethod; 
      note?: string;
      installmentNumber?: number;
    }
  ) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id !== accountId) return acc;

        const { updatedInstallments, distribution } = distributePayment(
          acc.installments, 
          paymentData.amount,
          paymentData.installmentNumber
        );

        const newPayment = {
          id: `pay_${Date.now()}`,
          amount: paymentData.amount,
          date: paymentData.date,
          method: paymentData.method,
          note: paymentData.note,
          registeredAt: new Date().toISOString(),
          distribution,
        };

        const updatedPayments = [...(acc.payments || []), newPayment];
        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const isSettled = totalPaid >= acc.totalAmount - 0.01;

        if (isSettled) {
          try {
            confetti({
              particleCount: 90,
              spread: 75,
              origin: { y: 0.6 },
              colors: ['#11C76F', '#0FA85D', '#E7FAF0', '#FFFFFF'],
            });
          } catch {}
          showToast(`Dívida de ${acc.debtorName} foi totalmente QUITADA! Parabéns!`);
        } else {
          showToast(`Amortização de ${formatCurrency(paymentData.amount)} abatida das últimas parcelas!`);
        }

        const updatedAccount = {
          ...acc,
          installments: updatedInstallments,
          payments: updatedPayments,
          status: isSettled ? ('quitado' as const) : ('parcial' as const),
        };

        if (canSyncWithSupabase) {
          saveAccountToSupabase(updatedAccount).catch((err) => console.error(err));
        }

        return updatedAccount;
      })
    );
  };

  // Excluir um pagamento específico e recalcular parcelas
  const handleDeletePayment = (accountId: string, paymentId: string) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id !== accountId) return acc;

        const remainingPayments = (acc.payments || []).filter((p) => p.id !== paymentId);
        const accountWithFiltered = {
          ...acc,
          payments: remainingPayments,
        };

        const recalculated = recalculateAccountFromPayments(accountWithFiltered);
        if (canSyncWithSupabase) {
          saveAccountToSupabase(recalculated).catch((err) => console.error(err));
        }
        return recalculated;
      })
    );
    showToast('Pagamento removido e parcelas recalculadas.');
  };

  // Reajustar todas as amortizações da conta para abater das últimas parcelas
  const handleRealignAmortization = (accountId: string) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id !== accountId) return acc;
        if (!acc.payments || acc.payments.length === 0) {
          showToast('Esta conta não possui pagamentos registrados.', 'info');
          return acc;
        }

        const recalculated = recalculateAccountFromPayments(acc);
        if (canSyncWithSupabase) {
          saveAccountToSupabase(recalculated).catch((err) => console.error(err));
        }
        return recalculated;
      })
    );
    showToast('Amortizações reorganizadas: abatimento aplicado nas últimas parcelas!');
  };

  // Quitação total imediata
  const handleQuickSettle = (account: DebtAccount) => {
    const { totalRemaining } = calculateAccountFinancials(account);
    if (totalRemaining <= 0) {
      showToast('Esta dívida já está quitada.', 'info');
      return;
    }

    if (
      !window.confirm(
        `Confirma a quitação integral de ${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(totalRemaining)} da conta de ${account.debtorName}?`
      )
    ) {
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const { updatedInstallments, distribution } = distributePayment(account.installments, totalRemaining);

    const settlementPayment = {
      id: `pay_${Date.now()}`,
      amount: totalRemaining,
      date: todayStr,
      method: 'pix' as PaymentMethod,
      note: 'Quitação total do saldo restante',
      registeredAt: new Date().toISOString(),
      distribution,
    };

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id !== account.id) return a;
        const updated = {
          ...a,
          installments: updatedInstallments,
          payments: [...(a.payments || []), settlementPayment],
          status: 'quitado' as const,
        };
        if (canSyncWithSupabase) {
          saveAccountToSupabase(updated).catch((err) => console.error(err));
        }
        return updated;
      })
    );

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#11C76F', '#0FA85D', '#E7FAF0', '#FFFFFF'],
      });
    } catch {}

    showToast(`Dívida de ${account.debtorName} quitada com sucesso!`);
  };

  // Exclusão de conta
  const handleDeleteAccount = (id: string) => {
    const target = accounts.find((a) => a.id === id);
    if (!target) return;

    if (window.confirm(`Tem certeza que deseja excluir a conta de ${target.debtorName}?`)) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      if (canSyncWithSupabase) {
        deleteAccountFromSupabase(id).catch((err) => console.error(err));
      }
      showToast(`Conta de ${target.debtorName} excluída.`);
    }
  };

  // Sincronização dos modais com os dados atualizados
  const currentDetailsAccount = selectedAccountForDetails
    ? accounts.find((a) => a.id === selectedAccountForDetails.id) || selectedAccountForDetails
    : null;

  const currentPaymentAccount = selectedAccountForPayment
    ? accounts.find((a) => a.id === selectedAccountForPayment.id) || selectedAccountForPayment
    : null;

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const summary = calculateDashboardSummary(accounts);

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white font-['Plus_Jakarta_Sans',sans-serif] flex flex-col selection:bg-[#11C76F] selection:text-[#0D0E12]">
      {/* Toast PicPay Style */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 border ${
            toast.type === 'success'
              ? 'bg-[#161821] border-[#11C76F]/40 text-[#11C76F]'
              : toast.type === 'warn'
              ? 'bg-[#161821] border-[#FF9500]/40 text-[#FF9500]'
              : 'bg-[#161821] border-[#262936] text-white'
          }`}>
            <span className="w-2 h-2 rounded-full bg-[#11C76F]" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenNewAccount={() => setIsNewAccountModalOpen(true)}
        onOpenPaymentModal={() => setIsGlobalPaymentModalOpen(true)}
        onLogout={handleLogout}
        pendingCount={summary.openCount + summary.partialCount}
        overdueCount={0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'inicio' ? (
          <DashboardTab
            accounts={accounts}
            onOpenNewAccount={() => setIsNewAccountModalOpen(true)}
            onNavigateToPayable={() => setActiveTab('a-pagar')}
            onOpenPaymentModal={(acc) => {
              if (acc) {
                setSelectedAccountForPayment(acc);
              } else {
                setIsGlobalPaymentModalOpen(true);
              }
            }}
            onOpenDetailsModal={(acc) => setSelectedAccountForDetails(acc)}
            onQuickSettle={handleQuickSettle}
          />
        ) : (
          <AccountsPayableTab
            accounts={accounts}
            onOpenNewAccount={() => setIsNewAccountModalOpen(true)}
            onOpenGeneralPaymentModal={() => setIsGlobalPaymentModalOpen(true)}
            onOpenPaymentModal={(acc) => setSelectedAccountForPayment(acc)}
            onOpenDetailsModal={(acc) => setSelectedAccountForDetails(acc)}
            onQuickSettle={handleQuickSettle}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      {/* Modais com montagem condicional */}
      {isNewAccountModalOpen && (
        <NewAccountModal
          isOpen={true}
          onClose={() => setIsNewAccountModalOpen(false)}
          onSave={handleCreateAccount}
          nextCodeSuggestion={getNextCodeSuggestion()}
        />
      )}

      {(isGlobalPaymentModalOpen || !!currentPaymentAccount) && (
        <AddPaymentModal
          isOpen={true}
          onClose={() => {
            setSelectedAccountForPayment(null);
            setIsGlobalPaymentModalOpen(false);
          }}
          account={currentPaymentAccount}
          accounts={accounts}
          onOpenNewAccount={() => {
            setSelectedAccountForPayment(null);
            setIsGlobalPaymentModalOpen(false);
            setIsNewAccountModalOpen(true);
          }}
          onAddPayment={handleAddPayment}
        />
      )}

      {!!currentDetailsAccount && (
        <PromissoryDetailsModal
          isOpen={true}
          onClose={() => setSelectedAccountForDetails(null)}
          account={currentDetailsAccount}
          onOpenPaymentModal={(acc) => setSelectedAccountForPayment(acc)}
          onQuickSettle={handleQuickSettle}
          onDeletePayment={handleDeletePayment}
          onRealignAmortization={handleRealignAmortization}
        />
      )}
    </div>
  );
}
