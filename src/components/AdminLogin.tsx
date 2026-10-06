import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'administrador' && password === '159753aa') {
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        <div className="bg-gradient-to-r from-gray-800 to-black p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-black text-2xl tracking-wide uppercase">Painel Admin</h2>
          <p className="text-gray-400 text-xs mt-1">Acesso restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-50">
          {error && (
            <div className="bg-red-100 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200 text-center animate-in fade-in">
              Usuário ou senha incorretos.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Usuário
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-black transition-all"
              />
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-black transition-all"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white font-black py-3.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>ENTRAR NO PAINEL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
