'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  User,
  Calendar,
  FileText,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface Note {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  author: {
    name: string;
    image: string;
    role: string;
  };
  post: {
    id: string;
    title: string;
    status: string;
  };
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/writer/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNoteTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; icon: any }> = {
      REVISION_REQUEST: { 
        label: 'Revision Request', 
        color: 'text-amber-600', 
        bg: 'bg-amber-50 border-amber-200',
        icon: AlertTriangle,
      },
      REJECTION: { 
        label: 'Rejection', 
        color: 'text-red-600', 
        bg: 'bg-red-50 border-red-200',
        icon: AlertTriangle,
      },
      APPROVAL: { 
        label: 'Approval', 
        color: 'text-green-600', 
        bg: 'bg-green-50 border-green-200',
        icon: CheckCircle,
      },
      GENERAL: { 
        label: 'Note', 
        color: 'text-slate-600', 
        bg: 'bg-slate-50 border-slate-200',
        icon: MessageSquare,
      },
      SUGGESTION: { 
        label: 'Suggestion', 
        color: 'text-blue-600', 
        bg: 'bg-blue-50 border-blue-200',
        icon: MessageSquare,
      },
    };
    return configs[type] || configs.GENERAL;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      EDITOR: 'Editor',
      SENIOR_EDITOR: 'Senior Editor',
      ADMIN: 'Admin',
      SUPER_ADMIN: 'Managing Editor',
    };
    return labels[role] || role;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Editorial Notes</h1>
        <p className="text-slate-500 text-sm mt-1">Feedback and notes from our editorial team</p>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-500">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No editorial notes</h3>
            <p className="text-slate-500">Feedback from editors will appear here</p>
          </div>
        ) : (
          notes.map((note) => {
            const config = getNoteTypeConfig(note.type);
            const NoteIcon = config.icon;

            return (
              <div 
                key={note.id} 
                className={`bg-white rounded-xl border overflow-hidden ${
                  note.type === 'REVISION_REQUEST' || note.type === 'REJECTION' 
                    ? 'border-l-4 border-l-amber-500' 
                    : 'border-slate-200'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg}`}>
                        <NoteIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <p className="text-sm text-slate-500 mt-1">
                          From {note.author.name} • {getRoleLabel(note.author.role)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Article Reference */}
                  <Link 
                    href={`/writer/articles/${note.post.id}`}
                    className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                      {note.post.title}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
                  </Link>

                  {/* Message */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap">{note.message}</p>
                  </div>

                  {/* Action Button for Revision Requests */}
                  {(note.type === 'REVISION_REQUEST' && note.post.status === 'CHANGES_REQUESTED') && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <Link
                        href={`/writer/articles/${note.post.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Edit Article <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Help Card */}
      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h4 className="font-medium text-slate-900 mb-2">Understanding Editorial Feedback</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Revision Request</p>
              <p className="text-slate-500 text-xs">Editor needs you to make changes before approval</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Approval</p>
              <p className="text-slate-500 text-xs">Your article has been approved for publication</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Suggestion</p>
              <p className="text-slate-500 text-xs">Optional feedback to improve your writing</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Rejection</p>
              <p className="text-slate-500 text-xs">Article not suitable - see reason for details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
