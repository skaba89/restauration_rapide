'use client';

import { cn } from '@/lib/utils';
import { Mic, MicOff, AlertCircle, Volume2 } from 'lucide-react';

export type VoiceIndicatorState = 'idle' | 'listening' | 'processing' | 'error' | 'success';

interface VoiceIndicatorProps {
  state: VoiceIndicatorState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
  errorMessage?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32',
};

const iconSizes = {
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function VoiceIndicator({ 
  state, 
  size = 'lg', 
  className,
  showLabel = true,
  errorMessage 
}: VoiceIndicatorProps) {
  const getStateStyles = () => {
    switch (state) {
      case 'listening':
        return 'bg-red-500 shadow-red-500/50';
      case 'processing':
        return 'bg-blue-500 shadow-blue-500/50';
      case 'error':
        return 'bg-red-600 shadow-red-600/50';
      case 'success':
        return 'bg-green-500 shadow-green-500/50';
      default:
        return 'bg-primary shadow-primary/30';
    }
  };

  const getStateLabel = () => {
    switch (state) {
      case 'listening':
        return 'Écoute en cours...';
      case 'processing':
        return 'Traitement...';
      case 'error':
        return errorMessage || 'Erreur';
      case 'success':
        return 'Commande reconnue!';
      default:
        return 'Appuyez pour parler';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic className={cn(iconSizes[size], 'text-white')} />;
      case 'processing':
        return (
          <div className="relative">
            <Mic className={cn(iconSizes[size], 'text-white animate-pulse')} />
          </div>
        );
      case 'error':
        return <AlertCircle className={cn(iconSizes[size], 'text-white')} />;
      case 'success':
        return <Volume2 className={cn(iconSizes[size], 'text-white')} />;
      default:
        return <Mic className={cn(iconSizes[size], 'text-white')} />;
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative">
        {/* Pulse rings for listening state */}
        {state === 'listening' && (
          <>
            <div 
              className={cn(
                'absolute inset-0 rounded-full bg-red-500/30 animate-ping',
                sizeClasses[size]
              )} 
            />
            <div 
              className={cn(
                'absolute inset-0 rounded-full bg-red-500/20 animate-pulse',
                sizeClasses[size]
              )}
              style={{ animationDelay: '0.2s' }}
            />
            <div 
              className={cn(
                'absolute inset-[-8px] rounded-full border-2 border-red-500/50 animate-ping',
                sizeClasses[size]
              )}
              style={{ animationDelay: '0.4s', animationDuration: '1.5s' }}
            />
          </>
        )}
        
        {/* Processing spinner */}
        {state === 'processing' && (
          <div 
            className={cn(
              'absolute inset-0 rounded-full border-4 border-white/30 border-t-white animate-spin',
              sizeClasses[size]
            )}
          />
        )}

        {/* Main button */}
        <button
          className={cn(
            'relative rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
            sizeClasses[size],
            getStateStyles(),
            state === 'listening' && 'animate-pulse'
          )}
        >
          {getIcon()}
        </button>
      </div>

      {/* State label */}
      {showLabel && (
        <div className="text-center">
          <p className={cn(
            'text-sm font-medium',
            state === 'error' ? 'text-red-600' : 'text-muted-foreground'
          )}>
            {getStateLabel()}
          </p>
        </div>
      )}
    </div>
  );
}

// Waveform visualization component
export function VoiceWaveform({ 
  isActive, 
  className 
}: { 
  isActive: boolean; 
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center gap-1 h-12', className)}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1 bg-primary rounded-full transition-all',
            isActive ? 'animate-bounce' : ''
          )}
          style={{
            height: isActive ? `${20 + Math.random() * 30}px` : '8px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: isActive ? '0.5s' : '0s',
          }}
        />
      ))}
    </div>
  );
}

// Audio level indicator bars
export function AudioLevelIndicator({ 
  level, 
  className 
}: { 
  level: number; // 0-100
  className?: string;
}) {
  const bars = 10;
  const activeBars = Math.ceil((level / 100) * bars);

  return (
    <div className={cn('flex items-center gap-0.5 h-8', className)}>
      {[...Array(bars)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1 rounded-full transition-all duration-75',
            i < activeBars 
              ? i < bars * 0.6 
                ? 'bg-green-500' 
                : i < bars * 0.8 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
              : 'bg-gray-300 dark:bg-gray-700'
          )}
          style={{
            height: `${4 + i * 2}px`,
          }}
        />
      ))}
    </div>
  );
}

// Transcript display component
export function TranscriptDisplay({ 
  transcript, 
  isInterim = false,
  className 
}: { 
  transcript: string; 
  isInterim?: boolean;
  className?: string;
}) {
  if (!transcript) return null;

  return (
    <div className={cn(
      'p-4 rounded-lg bg-muted',
      isInterim && 'opacity-60 italic',
      className
    )}>
      <p className="text-sm font-medium text-muted-foreground mb-1">
        {isInterim ? 'En cours...' : 'Vous avez dit:'}
      </p>
      <p className="text-lg">
        "{transcript}"
      </p>
    </div>
  );
}

// Command feedback component
export function CommandFeedback({ 
  command,
  className 
}: { 
  command: {
    type: string;
    itemName?: string;
    quantity?: number;
  } | null;
  className?: string;
}) {
  if (!command) return null;

  const getCommandMessage = () => {
    switch (command.type) {
      case 'add':
        return `✅ Ajouté: ${command.quantity || 1}x ${command.itemName}`;
      case 'remove':
        return `🗑️ Retiré: ${command.itemName}`;
      case 'cancel':
        return '🗑️ Panier vidé';
      case 'submit':
        return '✅ Commande envoyée!';
      case 'search':
        return `🔍 Recherche: ${command.itemName}`;
      default:
        return `❓ Commande non reconnue`;
    }
  };

  return (
    <div className={cn(
      'p-3 rounded-lg border',
      command.type === 'unknown' 
        ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
        : 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
      className
    )}>
      <p className="font-medium">{getCommandMessage()}</p>
    </div>
  );
}

export default VoiceIndicator;
