'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Project } from '@/types';
import { createProject } from '@/app/actions';
import { FolderKanban, Plus, ChevronDown, Check } from 'lucide-react';

interface ProjectSwitcherProps {
  projects: Project[];
  currentProjectId: string | null;
}

export default function ProjectSwitcher({ projects, currentProjectId }: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentProject = projects.find(p => p.id === currentProjectId);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const project = await createProject(newName.trim());
      setNewName('');
      setCreating(false);
      setOpen(false);
      router.push(`/?project=${project.id}`);
      router.refresh();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSwitch = (id: string) => {
    setOpen(false);
    router.push(`/?project=${id}`);
    router.refresh();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-surface-hover/60 hover:bg-surface-hover
          border border-border-light/50
          text-sm font-medium text-text-primary
          transition-all duration-200
          active:scale-[0.98]
        "
      >
        <FolderKanban className="w-4 h-4 text-brand-500" />
        <span className="max-w-[120px] truncate">
          {currentProject?.name || '选择项目'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-tertiary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="
          absolute top-full left-0 mt-2 w-64
          bg-surface border border-border-light
          rounded-2xl shadow-elevated
          py-2 z-50
          animate-scale-in origin-top-left
        ">
          <div className="px-3 py-1.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
            项目
          </div>

          <div className="max-h-[240px] overflow-y-auto">
            {projects.length === 0 && !creating && (
              <div className="px-4 py-3 text-sm text-text-tertiary text-center">
                还没有项目，创建一个吧
              </div>
            )}

            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => handleSwitch(project.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm
                  transition-all duration-150
                  hover:bg-surface-hover
                  ${project.id === currentProjectId ? 'text-brand-600 bg-brand-50/50 dark:bg-brand-500/5' : 'text-text-primary'}
                `}
              >
                <div className="w-6 h-6 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <FolderKanban className="w-3.5 h-3.5 text-brand-500" />
                </div>
                <span className="flex-1 text-left truncate">{project.name}</span>
                {project.id === currentProjectId && (
                  <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-border-light/50 mt-1 pt-1 px-2">
            {creating ? (
              <div className="flex items-center gap-2 px-2 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                  }}
                  placeholder="项目名称"
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm
                    bg-surface-hover border border-border-light
                    text-text-primary placeholder:text-text-tertiary
                    outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20
                    transition-all duration-200"
                  autoFocus
                />
                <button
                  onClick={handleCreate}
                  disabled={loading || !newName.trim()}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium
                    bg-brand-600 text-white hover:bg-brand-700
                    disabled:opacity-50 transition-all duration-200"
                >
                  创建
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCreating(true);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm
                  text-text-tertiary hover:text-text-primary
                  hover:bg-surface-hover rounded-xl
                  transition-all duration-200
                "
              >
                <Plus className="w-4 h-4" />
                <span>新建项目</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
