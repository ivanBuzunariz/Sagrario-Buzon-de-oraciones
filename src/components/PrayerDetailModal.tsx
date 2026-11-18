import React, { useState } from 'react';
import {
  CheckCircle2,
  Eye,
  MessageSquarePlus,
  Pin,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import type { Prayer } from '../types/prayer';
import {
  CATEGORY_LABELS,
  derivePrayerDisplayTitle,
  formatSpanishDate,
} from '../utils/prayerStorage';

interface PrayerDetailModalProps {
  prayer: Prayer;
  discreetMode: boolean;
  onClose: () => void;
  onMarkAnswered: (id: string, answerNote?: string) => void;
  onReopen: (id: string) => void;
  onAddNote: (id: string, text: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PrayerDetailModal: React.FC<PrayerDetailModalProps> = ({
  prayer,
  discreetMode,
  onClose,
  onMarkAnswered,
  onReopen,
  onAddNote,
  onTogglePin,
  onDelete,
}) => {
  const [revealed, setRevealed] = useState(!discreetMode);
  const [noteInput, setNoteInput] = useState('');
  const [noteError, setNoteError] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState(prayer.answerNote ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) {
      setNoteError('Escribe una nota antes de añadirla.');
      return;
    }
    setNoteError('');
    onAddNote(prayer.id, noteInput);
    setNoteInput('');
  };

  const handleConfirmAnswered = (e: React.FormEvent) => {
    e.preventDefault();
    onMarkAnswered(prayer.id, answerText);
    setShowAnswerForm(false);
  };

  const displayTitle = derivePrayerDisplayTitle(prayer);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pb-16 backdrop-blur-sm sm:pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl sm:max-h-[90vh] sm:p-8 dark:border-zinc-800 dark:bg-[#111114]">
        {/* Header metadata & close */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-zinc-400">
              <span>{CATEGORY_LABELS[prayer.category]}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{formatSpanishDate(prayer.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  prayer.status === 'answered'
                    ? 'font-medium text-emerald-700 dark:text-[#D4AF6A]'
                    : ''
                }
              >
                {prayer.status === 'answered' ? 'Respondida' : 'En espera'}
              </span>
            </div>

            <h2
              id="detail-modal-title"
              className="mt-2 font-serif-display text-2xl font-semibold leading-snug text-stone-900 sm:text-3xl dark:text-[#F3EFE6]"
            >
              {revealed ? displayTitle : 'Oración protegida en modo discreto'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle de oración"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body Content or Discreet Cover */}
        {!revealed ? (
          <div className="mt-6 rounded-xl border border-stone-200 bg-[#F8F6F1]/80 p-6 text-center dark:border-zinc-800 dark:bg-[#09090B]">
            <p className="text-sm text-stone-600 dark:text-zinc-400">
              El texto está oculto para proteger tu privacidad mientras alguien pueda mirar tu pantalla.
            </p>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-zinc-800 dark:text-[#F3EFE6] dark:hover:bg-zinc-700"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              <span>Revelar esta oración</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-800 dark:text-zinc-200">
              {prayer.body}
            </div>

            {prayer.verse && (
              <p className="font-serif-display text-lg italic text-stone-600 dark:text-zinc-400">
                “{prayer.verse}”
              </p>
            )}

            {/* Answer Testimony Section */}
            {prayer.status === 'answered' && (
              <div className="rounded-xl border border-stone-200 bg-[#F8F6F1]/70 p-4 dark:border-[#D4AF6A]/30 dark:bg-[#09090B]">
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-emerald-700 dark:text-[#D4AF6A]">
                  <span>Oración respondida</span>
                  {prayer.answeredAt && (
                    <span className="tabular-nums">{formatSpanishDate(prayer.answeredAt)}</span>
                  )}
                </div>
                {prayer.answerNote ? (
                  <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-zinc-300">
                    {prayer.answerNote}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-stone-500 dark:text-zinc-500">
                    Agradecida y guardada como testimonio en tu buzón.
                  </p>
                )}
              </div>
            )}

            {/* Follow-up notes */}
            {prayer.notes.length > 0 && (
              <div className="space-y-3 border-t border-stone-200 pt-5 dark:border-zinc-800">
                <h3 className="text-xs font-medium text-stone-500 dark:text-zinc-400">
                  Seguimiento y reflexiones
                </h3>
                <ul className="space-y-2.5">
                  {prayer.notes.map((note) => (
                    <li
                      key={note.id}
                      className="rounded-xl border border-stone-200/80 bg-[#F8F6F1]/50 px-3.5 py-2.5 text-sm text-stone-700 dark:border-zinc-800/80 dark:bg-[#09090B] dark:text-zinc-300"
                    >
                      <p className="leading-relaxed">{note.text}</p>
                      <span className="mt-1 block text-xs text-stone-400 tabular-nums dark:text-zinc-500">
                        {formatSpanishDate(note.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add Follow-up Note Form */}
            <form onSubmit={handleSaveNote} className="border-t border-stone-200 pt-5 dark:border-zinc-800">
              <label
                htmlFor="follow-up-note"
                className="block text-xs font-medium text-stone-600 dark:text-zinc-400"
              >
                Añadir nota al seguimiento
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="follow-up-note"
                  type="text"
                  value={noteInput}
                  onChange={(e) => {
                    setNoteInput(e.target.value);
                    if (noteError) setNoteError('');
                  }}
                  placeholder="Anota cómo evoluciona o qué sientes hoy…"
                  className="min-h-[44px] flex-1 rounded-xl border border-stone-200 bg-[#F8F6F1]/60 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#9A7228] focus:outline-none dark:border-zinc-800 dark:bg-[#09090B] dark:text-[#F3EFE6] dark:placeholder:text-zinc-600 dark:focus:border-[#D4AF6A]"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap shrink-0"
                >
                  <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                  <span>Guardar nota</span>
                </button>
              </div>
              {noteError && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                  {noteError}
                </p>
              )}
            </form>

            {/* Mark Answered Form */}
            {showAnswerForm && (
              <form
                onSubmit={handleConfirmAnswered}
                className="space-y-3 rounded-xl border border-stone-200 bg-[#F8F6F1]/80 p-4 dark:border-zinc-800 dark:bg-[#09090B]"
              >
                <label
                  htmlFor="answer-testimony"
                  className="block text-xs font-medium text-stone-700 dark:text-zinc-300"
                >
                  Nota de gratitud o respuesta (opcional)
                </label>
                <textarea
                  id="answer-testimony"
                  rows={3}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Describe brevemente cómo respondió Dios o qué paz recibiste…"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#9A7228] focus:outline-none dark:border-zinc-800 dark:bg-[#111114] dark:text-[#F3EFE6] dark:placeholder:text-zinc-600 dark:focus:border-[#D4AF6A]"
                />
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAnswerForm(false)}
                    className="min-h-[40px] rounded-xl px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="min-h-[40px] rounded-xl bg-[#9A7228] px-4 py-2 text-xs font-medium text-white hover:bg-[#846020] dark:bg-[#D4AF6A] dark:text-[#09090B] dark:hover:bg-[#E0BE7D]"
                  >
                    Confirmar respuesta
                  </button>
                </div>
              </form>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-5 dark:border-zinc-800">
              <div className="flex flex-wrap items-center gap-2">
                {prayer.status === 'active' && !showAnswerForm && (
                  <button
                    type="button"
                    onClick={() => setShowAnswerForm(true)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#9A7228] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#846020] dark:bg-[#D4AF6A] dark:text-[#09090B] dark:hover:bg-[#E0BE7D] whitespace-nowrap shrink-0"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>Marcar como respondida</span>
                  </button>
                )}
                {prayer.status === 'answered' && (
                  <button
                    type="button"
                    onClick={() => onReopen(prayer.id)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Volver a poner en espera</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onTogglePin(prayer.id)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 whitespace-nowrap shrink-0"
                >
                  <Pin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{prayer.isPinned ? 'Quitar fijación' : 'Fijar arriba'}</span>
                </button>
              </div>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 whitespace-nowrap shrink-0"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>Eliminar</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="min-h-[40px] rounded-xl px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(prayer.id)}
                    className="min-h-[40px] rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                  >
                    Sí, eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
