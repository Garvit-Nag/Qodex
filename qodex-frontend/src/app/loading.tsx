'use client';

import LiquidEther from '@/components/LiquidEther';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black relative">
      <div className="fixed inset-0 z-0">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={15}
          cursorSize={80}
          resolution={0.4}
          autoDemo={true}
          autoSpeed={0.3}
          autoIntensity={1.8}
        />
      </div>

      <div className="fixed inset-0 flex items-center justify-center z-10">
        <div className="loader">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <style jsx>{`
          .loader {
            display: inline-block;
            position: relative;
            width: 80px;
            height: 80px;
          }
          .loader div {
            position: absolute;
            top: 33px;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: #a855f7;
            animation-timing-function: cubic-bezier(0, 1, 1, 0);
          }
          .loader div:nth-child(1) {
            left: 8px;
            animation: flip1 0.6s infinite;
          }
          .loader div:nth-child(2) {
            left: 8px;
            animation: flip2 0.6s infinite;
          }
          .loader div:nth-child(3) {
            left: 32px;
            animation: flip2 0.6s infinite;
          }
          .loader div:nth-child(4) {
            left: 56px;
            animation: flip3 0.6s infinite;
          }
          @keyframes flip1 {
            0% {
              transform: scale(0);
            }
            100% {
              transform: scale(1);
            }
          }
          @keyframes flip3 {
            0% {
              transform: scale(1);
            }
            100% {
              transform: scale(0);
            }
          }
          @keyframes flip2 {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(24px, 0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}