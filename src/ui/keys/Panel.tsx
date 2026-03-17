import {
  Alert01Icon,
  Attachment01Icon,
  Cancel01Icon,
  type File01Icon,
} from '@hugeicons/core-free-icons';
import { type FC, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button, Icon } from '../shared';
import { FileThumb } from './FileThumb';
import { formatFileSize, type PanelState } from './useEncryptChat';

export const Panel: FC<{
  label: string;
  state: PanelState;
  placeholder: string;
  onTextChange?: (text: string) => void;
  onFileChange?: (file: File | null) => void;
  onFilePick?: () => void;
  onClear?: () => void;
  shareAction?: {
    label: string;
    icon: typeof File01Icon;
    onClick: () => void;
  };
}> = ({
  label,
  state,
  placeholder,
  onTextChange,
  onFileChange,
  onFilePick,
  onClear,
  shareAction,
}) => {
  const [dragging, setDragging] = useState(false);
  const hasContent = !!(state.text || state.file || state.error);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!onFileChange) return;
      e.preventDefault();
      setDragging(true);
    },
    [onFileChange],
  );

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!onFileChange) return;
      const f = e.dataTransfer.files[0];
      if (f) onFileChange(f);
    },
    [onFileChange],
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-drop zone
    <div
      className="flex-1 flex flex-col min-h-0 gap-3 p-3"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between shrink-0 min-h-6">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          {label}
        </span>
        {hasContent ? (
          <div className="flex items-center gap-1">
            {shareAction && !state.error && (
              <Button variant="ghost" size="sm" onClick={shareAction.onClick}>
                <Icon icon={shareAction.icon} size="sm" />
                {shareAction.label}
              </Button>
            )}
            {onClear && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                <Icon icon={Cancel01Icon} size="sm" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {onFilePick && (
              <Button variant="ghost" size="sm" onClick={onFilePick}>
                <Icon icon={Attachment01Icon} size="sm" />
                Attach
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Panel content */}
      <div
        className={twMerge(
          'flex-1 min-h-0 rounded-lg transition-colors',
          dragging && 'bg-primary/5 ring-2 ring-primary/30 ring-dashed',
        )}
      >
        {state.error ? (
          <div className="flex items-start gap-2">
            <Icon
              icon={Alert01Icon}
              size="sm"
              className="text-error shrink-0 mt-0.5"
            />
            <p className="text-sm text-error">{state.error}</p>
          </div>
        ) : state.file ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 overflow-y-auto">
            <FileThumb file={state.file} />
            <p className="text-sm text-text truncate max-w-full text-center">
              {state.file.name}
            </p>
            <p className="text-xs text-text-muted">
              {formatFileSize(state.file.size)}
            </p>
          </div>
        ) : (
          <textarea
            dir="auto"
            readOnly={!onTextChange}
            className={twMerge(
              'w-full h-full resize-none bg-transparent text-text text-sm outline-none placeholder:text-text-muted overflow-y-auto',
              !onTextChange && 'select-all',
            )}
            placeholder={dragging ? 'Drop file here...' : placeholder}
            value={state.text}
            onInput={
              onTextChange
                ? (e) => onTextChange((e.target as HTMLTextAreaElement).value)
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
};
