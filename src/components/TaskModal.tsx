import React from 'react';
import { X, CheckCircle2, ChevronRight, Sparkles, Gift } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  reward: string;
  done: boolean;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onCompleteTask: (id: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onCompleteTask,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-4 border-[#b91524]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#b91524] to-[#ee4d2d] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-yellow-300" />
            <div>
              <h3 className="font-black text-lg">Tarefas Diárias</h3>
              <p className="text-[11px] text-white/80">Cumpra tarefas e ganhe chances extras</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task list */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                task.done
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-xs'
              }`}
            >
              <div className="flex-1">
                <h4 className={`text-xs md:text-sm font-bold ${task.done ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 mt-0.5">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span>+{task.reward}</span>
                </div>
              </div>

              <div>
                {task.done ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Concluído
                  </span>
                ) : (
                  <button
                    onClick={() => onCompleteTask(task.id)}
                    className="bg-[#ee4d2d] hover:bg-[#d73f21] text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    Fazer
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-500">
            As tarefas são renovadas todos os dias às 00:00!
          </p>
        </div>
      </div>
    </div>
  );
};
