import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PromissoryNote, PaymentMethod } from './types';
import { 
  loadPromissoryNotes, 
  savePromissoryNotes, 
  calculateNoteFinancials, 
  calculateDashboardSummary 
} from './utils/storage';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { AccountsPayableTab } from './components/AccountsPayableTab';
import { NewAccountModal } from './components/NewAccountModal';
import { AddPaymentModal } from './components/AddPaymentModal';
import { PromissoryDetailsModal } from './components/PromissoryDetailsModal';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('promissory_auth') === 'true';
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'inicio' | 'a-pagar'>('inicio');

  // Notes state with persistence
  const [notes, setNotes] = useState<PromissoryNote[]>(() => {
    return loadPromissoryNotes();
  });

  // Modals state
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [selectedNoteForPayment, setSelectedNoteForPayment] = useState<PromissoryNote | null>(null);
  const [selectedNoteForDetails, setSelectedNoteForDetails] = useState<PromissoryNote | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    savePromissoryNotes(notes);
  }, [notes]);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleLogin = () => {
    localStorage.setItem('promissory_auth', 'true');
    setIsAuthenticated(true);
    showToast('Login realizado com sucesso! Bem-vindo.');
  };

  const handleLogout = () => {
    localStorage.removeItem('promissory_auth');
    setIsAuthenticated(false);
    showToast('Sessão finalizada com sucesso.', 'info');
  };

  // Generate next promissory code suggestion (e.g. PROM-005)
  const getNextCodeSuggestion = () => {
    const existingNumbers = notes.map((n) => {
      const match = n.code.match(/PROM-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers, 0) : 0;
    const nextNum = maxNum + 1;
    return `PROM-${String(nextNum).padStart(3, '0')}`;
  };

  // Create new promissory note
  const handleCreateNote = (
    noteData: Omit<PromissoryNote, 'id' | 'payments' | 'createdAt' | 'status'>
  ) => {
    const newNote: PromissoryNote = {
      ...noteData,
      id: `prom_${Date.now()}`,
      payments: [],
      status: 'pendente',
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);
    showToast(`Nota promissória ${newNote.code} cadastrada com sucesso!`);
  };

  // Add payment / amortização
  const handleAddPayment = (
    noteId: string,
    paymentData: { amount: number; date: string; method: PaymentMethod; note?: string }
  ) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id !== noteId) return note;

        const newPayment = {
          id: `pay_${Date.now()}`,
          amount: paymentData.amount,
          date: paymentData.date,
          method: paymentData.method,
          note: paymentData.note,
          registeredAt: new Date().toISOString(),
        };

        const updatedPayments = [...(note.payments || []), newPayment];
        const totalPaid = updatedPayments.reduce((acc, p) => acc + p.amount, 0);
        const isSettled = totalPaid >= note.totalAmount - 0.01;

        if (isSettled) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {}
          showToast(`Promissória ${note.code} foi totalmente QUITADA! Parabéns!`);
        } else {
          showToast(`Pagamento de R$ ${paymentData.amount.toFixed(2)} registrado com sucesso!`);
        }

        return {
          ...note,
          payments: updatedPayments,
          status: isSettled ? 'quitado' : 'parcial',
        };
      })
    );
  };

  // Quick settle (quitar saldo restante instantaneamente)
  const handleQuickSettle = (note: PromissoryNote) => {
    const { remainingAmount } = calculateNoteFinancials(note);
    if (remainingAmount <= 0) {
      showToast('Esta promissória já está quitada.', 'info');
      return;
    }

    if (
      !window.confirm(
        `Deseja quitar integralmente o saldo restante de ${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(remainingAmount)} da promissória ${note.code}?`
      )
    ) {
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const settlementPayment = {
      id: `pay_${Date.now()}`,
      amount: remainingAmount,
      date: todayStr,
      method: 'pix' as PaymentMethod,
      note: 'Quitação integral do saldo devedor',
      registeredAt: new Date().toISOString(),
    };

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== note.id) return n;
        return {
          ...n,
          payments: [...(n.payments || []), settlementPayment],
          status: 'quitado',
        };
      })
    );

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}

    showToast(`Promissória ${note.code} foi quitada com sucesso!`);
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    if (window.confirm(`Tem certeza que deseja excluir a promissória ${target.code} (${target.title})?`)) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast(`Promissória ${target.code} excluída.`);
    }
  };

  // Keep details modal synchronized with updated note data
  const currentDetailsNote = selectedNoteForDetails
    ? notes.find((n) => n.id === selectedNoteForDetails.id) || null
    : null;

  // Keep payment modal synchronized
  const currentPaymentNote = selectedNoteForPayment
    ? notes.find((n) => n.id === selectedNoteForPayment.id) || null
    : null;

  // If not logged in, render the clean login screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const summary = calculateDashboardSummary(notes);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl text-white text-xs font-bold flex items-center gap-2 border ${
            toast.type === 'success'
              ? 'bg-emerald-700 border-emerald-600 shadow-emerald-700/25'
              : toast.type === 'warn'
              ? 'bg-amber-600 border-amber-500 shadow-amber-600/25'
              : 'bg-slate-900 border-slate-800'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Primary Header with Tabs & User Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenNewAccount={() => setIsNewAccountModalOpen(true)}
        onLogout={handleLogout}
        pendingCount={summary.pendingCount + summary.partialCount}
        overdueCount={summary.overdueCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'inicio' ? (
          <DashboardTab
            notes={notes}
            onOpenNewAccount={() => setIsNewAccountModalOpen(true)}
            onNavigateToPayable={() => setActiveTab('a-pagar')}
            onOpenPaymentModal={(note) => setSelectedNoteForPayment(note)}
            onOpenDetailsModal={(note) => setSelectedNoteForDetails(note)}
            onQuickSettle={handleQuickSettle}
          />
        ) : (
          <AccountsPayableTab
            notes={notes}
            onOpenNewAccount={() => setIsNewAccountModalOpen(true)}
            onOpenPaymentModal={(note) => setSelectedNoteForPayment(note)}
            onOpenDetailsModal={(note) => setSelectedNoteForDetails(note)}
            onQuickSettle={handleQuickSettle}
            onDeleteNote={handleDeleteNote}
          />
        )}
      </main>

      {/* Modal: Nova Conta / Promissória */}
      <NewAccountModal
        isOpen={isNewAccountModalOpen}
        onClose={() => setIsNewAccountModalOpen(false)}
        onSave={handleCreateNote}
        nextCodeSuggestion={getNextCodeSuggestion()}
      />

      {/* Modal: Adicionar Pagamento / Amortização */}
      <AddPaymentModal
        isOpen={!!currentPaymentNote}
        onClose={() => setSelectedNoteForPayment(null)}
        note={currentPaymentNote}
        onAddPayment={handleAddPayment}
      />

      {/* Modal: Visualizar Detalhes & Documento da Promissória */}
      <PromissoryDetailsModal
        isOpen={!!currentDetailsNote}
        onClose={() => setSelectedNoteForDetails(null)}
        note={currentDetailsNote}
        onOpenPaymentModal={(note) => setSelectedNoteForPayment(note)}
        onQuickSettle={handleQuickSettle}
      />
    </div>
  );
}
