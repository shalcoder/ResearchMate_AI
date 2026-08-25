import React from 'react';
import { UserRole } from '../../types';

interface UnauthorizedStateProps {
  requiredRoles: UserRole[];
  currentRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
}

export const UnauthorizedState: React.FC<UnauthorizedStateProps> = ({
  requiredRoles,
  currentRole,
  onSwitchRole,
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-slate-900/60 border border-rose-900/30 rounded-2xl backdrop-blur-xl shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 text-2xl font-bold shadow-inner">
        🔒
      </div>
      <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full mb-3">
        403 Access Denied
      </span>
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Unauthorized Role Access</h2>
      <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
        Your current active role (<span className="text-indigo-400 font-semibold uppercase">{currentRole || 'Guest'}</span>) does not have permission to access this module.
        Required role: <span className="text-amber-400 font-medium">{requiredRoles.join(' or ')}</span>.
      </p>

      {onSwitchRole && (
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 w-full max-w-md">
          <p className="text-xs text-slate-400 font-medium mb-3">Switch demo persona to test role access:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {requiredRoles.map((role) => (
              <button
                key={role}
                onClick={() => onSwitchRole(role)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-all shadow-md capitalize"
              >
                Switch to {role}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
