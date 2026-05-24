'use client'

import { useState, useTransition } from 'react'
import { Crown, BadgeCheck, User, ChevronDown, AlertCircle } from 'lucide-react'
import { setTeamRoleAction } from './role-actions'

type TeamRole = 'zaakvoerder' | 'makelaar' | 'assistent'

const LABEL: Record<TeamRole, string> = {
  zaakvoerder: 'Zaakvoerder',
  makelaar: 'Makelaar',
  assistent: 'Assistent',
}

const BG: Record<TeamRole, string> = {
  zaakvoerder: '#0b4f58',
  makelaar:    '#a25b3a',
  assistent:   '#5a7a48',
}

function IconFor({ role }: { role: TeamRole }) {
  if (role === 'zaakvoerder') return <Crown className="size-2.5" />
  if (role === 'makelaar') return <BadgeCheck className="size-2.5" />
  return <User className="size-2.5" />
}

export function RoleBadge({
  userId,
  initialRole,
  canEdit,
}: {
  userId: string
  initialRole: TeamRole
  canEdit: boolean
}) {
  const [role, setRole] = useState<TeamRole>(initialRole)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function changeTo(next: TeamRole) {
    if (next === role) {
      setOpen(false)
      return
    }
    setOpen(false)
    setError(null)
    const prev = role
    setRole(next)
    startTransition(async () => {
      const res = await setTeamRoleAction(userId, next)
      if (!res.ok) {
        setRole(prev)
        setError(res.error ?? 'Wijzigen mislukt')
      }
    })
  }

  const badgeContent = (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.12em] font-medium z-10"
      style={{ background: BG[role], color: '#fff' }}
    >
      <IconFor role={role} />
      {LABEL[role]}
      {canEdit && <ChevronDown className="size-2.5 opacity-70" />}
    </span>
  )

  if (!canEdit) {
    return (
      <span className="absolute -top-2 left-3 z-10">
        {badgeContent}
      </span>
    )
  }

  return (
    <div className="absolute -top-2 left-3 z-20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        title="Wijzig rol"
        className="disabled:opacity-50"
      >
        {badgeContent}
      </button>
      {open && (
        <ul
          className="absolute top-full left-0 mt-1 min-w-[150px] py-1 z-30"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
        >
          {(['zaakvoerder', 'makelaar', 'assistent'] as TeamRole[]).map((r) => (
            <li key={r}>
              <button
                type="button"
                onClick={() => changeTo(r)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-paper-2)] inline-flex items-center gap-2"
                style={{
                  fontWeight: r === role ? 600 : 400,
                  color: r === role ? BG[r] : 'inherit',
                }}
              >
                <span className="inline-flex size-2 rounded-full" style={{ background: BG[r] }} />
                {LABEL[r]}
                {r === role && <span className="ml-auto text-[var(--color-mute)]">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <div className="absolute top-full left-0 mt-1 px-2 py-1 text-[0.6rem] inline-flex items-center gap-1 z-30"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertCircle className="size-2.5" />
          {error}
        </div>
      )}
    </div>
  )
}
