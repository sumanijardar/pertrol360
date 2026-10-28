import React from 'react';
import { Badge } from './ui/badge';

export default function Footer() {
  return (
    <footer
      className="bg-card/90 border-t border-border px-3.5 py-1.5 flex items-center justify-between flex-wrap gap-2 text-[11px] text-muted-foreground mt-auto transition-colors select-none"
      style={{ minHeight: '30px' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-foreground tracking-tight">PATROL360</span>
        <span className="text-border">•</span>
        <span>Government of Gujarat — Police Home Department</span>
        <span className="text-border">•</span>
        <span>
          Edge Queue: <strong className="font-medium text-foreground">Store-and-Forward Active</strong>
        </span>
      </div>

      <div className="flex items-center gap-2 font-mono text-[10px]">
        <Badge
          variant="destructive"
          className="text-[9.5px] font-semibold tracking-wide uppercase px-1.5 py-0 h-4 rounded"
        >
          RESTRICTED / LAW ENFORCEMENT ONLY
        </Badge>
      </div>
    </footer>
  );
}
