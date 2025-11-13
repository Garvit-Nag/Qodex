'use client';

import { useState } from 'react';
import { Copy, Check, Calendar, CreditCard } from 'lucide-react';
import Image from 'next/image';

interface DemoCardModalProps {
  onClose: () => void;
  onContinue: () => void;
}

export default function DemoCardModal({ onClose, onContinue }: DemoCardModalProps) {
  const [copied, setCopied] = useState(false);

  const cardNumber = '4242 4242 4242 4242';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-4 max-w-lg w-full border border-border">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-foreground mb-1">
            Demo Payment Details
          </h2>
          <p className="text-muted-foreground text-sm">
            Use this test card to complete your upgrade
          </p>
        </div>

        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 mb-3 text-white relative overflow-hidden shadow-lg h-64">
          <div className="flex justify-between items-start mb-4">
            <Image
              src="/chip-icon.png"
              alt="Chip"
              width={40}
              height={30}
              className="opacity-90"
            />
            <Image
              src="/mastercard-logo.svg"
              alt="Mastercard"
              width={80}
              height={48}
              className="opacity-95"
            />
          </div>

          <div className="mb-4">
            <div className="text-xs opacity-70 mb-2 tracking-wider">CARD NUMBER</div>
            <div className="flex items-center gap-3">
              <div className="text-xl font-mono tracking-[0.2em] font-light">
                4242 4242 4242 4242
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={copied ? 'Copied!' : 'Copy card number'}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 opacity-80" />
                )}
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-12">
              <div>
                <div className="text-xs opacity-70 mb-2 tracking-wider font-light">VALID THRU</div>
                <div className="text-lg font-mono font-medium tracking-wide">MM/YY</div>
              </div>
              <div>
                <div className="text-xs opacity-70 mb-2 tracking-wider font-light">CVC</div>
                <div className="text-lg font-mono font-medium tracking-wide">XXX</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="w-8 h-8 bg-gray-200 dark:bg-muted/50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Expiry Date</div>
              <div className="text-xs text-muted-foreground">Any future date (12/34)</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="w-8 h-8 bg-gray-200 dark:bg-muted/50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">CVC Code</div>
              <div className="text-xs text-muted-foreground">Any 3 digits (123)</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-2 px-4 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black transition-colors text-sm"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}