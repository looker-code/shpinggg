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
  // Estado de autenticação persistido
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('promissory_auth_v2') === 'true';
  });

  // Aba ativa
  const [activeTab, setActiveTab] = useState<'inicio' | 'a-pagar'>('inicio');

  // Base corporativa de notas promissórias
  const [notes, setNotes] = useState<PromissoryNote[]>(() => {
    return loadPromissoryNotes();
  });

  // Controle de modais
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [selectedNoteForPayment, setSelectedNoteForPayment] = useState<PromissoryNote | null>(null);
  const [selectedNoteForDetails, setSelectedNoteForDetails] = useState<PromissoryNote | null>(null);

  // Notificações flutuantes (Toast)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  useEffect(() => {
    savePromissoryNotes(notes);
  }, [notes]);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLogin = () => {
    localStorage.setItem('promissory_auth_v2', 'true');
    setIsAuthenticated(true);
    showToast('Autenticação corporativa confirmada. Livro razão aberto.');
  };

  const handleLogout = () => {
    localStorage.removeItem('promissory_auth_v2');
    setIsAuthenticated(false);
    showToast('Sessão fiduciária finalizada com segurança.', 'info');
  };

  // Gerador de código sequencial fiduciário (ex: NP-2026/093)
  const getNextCodeSuggestion = () => {
    const currentYear = new Date().getFullYear();
    const existingNumbers = notes.map((n) => {
      const match = n.code.match(/NP-\d+\/(\d+)/i) || n.code.match(/PROM-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers, 0) : 0;
    const nextNum = maxNum + 1;
    return `NP-${currentYear}/${String(nextNum).padStart(3, '0')}`;
  };

  // Criação de nova promissória
  const handleCreateNote = (
    noteData: Omit<PromissoryNote, 'id' | 'payments' | 'createdAt' | 'status'>
  ) => {
    const newNote: PromissoryNote = {
      ...noteData,
      id: `np_${Date.now()}`,
      payments: [],
      status: 'pendente',
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);
    showToast(`Nota Promissória ${newNote.code} emitida e registrada com eficácia executiva!`);
  };

  // Amortização parcial ou total
  const handleAddPayment = (
    noteId: string,
    paymentData: { amount: number; date: string; method: PaymentMethod; note?: string; authCode?: string }
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
          authCode: paymentData.authCode,
          registeredAt: new Date().toISOString(),
        };

        const updatedPayments = [...(note.payments || []), newPayment];
        const totalPaid = updatedPayments.reduce((acc, p) => acc + p.amount, 0);
        const isSettled = totalPaid >= note.totalAmount - 0.01;

        if (isSettled) {
          try {
            confetti({
              particleCount: 110,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#10b981', '#34d399', '#059669', '#ffffff', '#fbbf24'],
            });
          } catch {}
          showToast(`Cédula ${note.code} foi totalmente LIQUIDADA e RESGATADA!`);
        } else {
          showToast(`Amortização de R$ ${paymentData.amount.toFixed(2)} averbada no livro.`);
        }

        return {
          ...note,
          payments: updatedPayments,
          status: isSettled ? 'quitado' : 'parcial',
        };
      })
    );
  };

  // Liquidação integral instantânea
  const handleQuickSettle = (note: PromissoryNote) => {
    const { remainingAmount } = calculateNoteFinancials(note);
    if (remainingAmount <= 0) {
      showToast('Este título já se encontra integralmente liquidado.', 'info');
      return;
    }

    if (
      !window.confirm(
        `Confirma a liquidação integral do passivo de ${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(remainingAmount)} referente à Nota Promissória ${note.code}?`
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
      note: 'Liquidação integral para resgate definitivo do título',
      authCode: `LIQ-INTEGRAL-${Date.now().toString().slice(-6)}`,
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
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#ffffff', '#fbbf24'],
      });
    } catch {}

    showToast(`Nota Promissória ${note.code} liquidada com eficácia plena!`);
  };

  // Exclusão de nota
  const handleDeleteNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    if (window.confirm(`Confirma a baixa e exclusão do registro do título ${target.code} (${target.title})?`)) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast(`Título ${target.code} cancelado no livro.`);
    }
  };

  const currentDetailsNote = selectedNoteForDetails
    ? notes.find((n) => n.id === selectedNoteForDetails.id) || null
    : null;

  const currentPaymentNote = selectedNoteForPayment
    ? notes.find((n) => n.id === selectedNoteForPayment.id) || null
    : null;

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const summary = calculateDashboardSummary(notes);

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 font-['Inter',sans-serif] flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 font-mono">
          <div className={`px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-white text-xs font-bold flex items-center gap-2 border ${
            toast.type === 'success'
              ? 'bg-[#06241a] border-emerald-500/50 text-emerald-300 shadow-emerald-500/10'
              : toast.type === 'warn'
              ? 'bg-[#291708] border-amber-500/50 text-amber-300'
              : 'bg-[#0f172a] border-slate-700 text-slate-200'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Primary Header */}
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

      {/* Modais */}
      <NewAccountModal
        isOpen={isNewAccountModalOpen}
        onClose={() => setIsNewAccountModalOpen(false)}
        onSave={handleCreateNote}
        nextCodeSuggestion={getNextCodeSuggestion()}
      />

      <AddPaymentModal
        isOpen={!!currentPaymentNote}
        onClose={() => setSelectedNoteForPayment(null)}
        note={currentPaymentNote}
        onAddPayment={handleAddPayment}
      />

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
