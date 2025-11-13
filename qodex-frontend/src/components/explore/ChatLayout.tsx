'use client';

import { Repository } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import LiquidEther from '@/components/LiquidEther';
import ChatSidebar from './ChatSidebar';
import ChatMainPanel from './ChatMainPanel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface ChatLayoutProps {
  repositories: Repository[];
  selectedRepo: Repository | null;
  onRepoSelect: (repo: Repository) => void;
  onNewChat: () => void;
  onRepoDelete: (repoId: string) => Promise<void>;
  loading: boolean;
  getRepoStatus: (repo: Repository) => string;
}

export default function ChatLayout({
  repositories,
  selectedRepo,
  onRepoSelect,
  onNewChat,
  onRepoDelete,
  loading,
  getRepoStatus
}: ChatLayoutProps) {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

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

      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[calc(100vh-5rem)]">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <div className="h-full bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-3xl shadow-xl mr-3">
                  <ChatSidebar
                    repositories={repositories}
                    selectedRepo={selectedRepo}
                    onRepoSelect={onRepoSelect}
                    onNewChat={onNewChat}
                    onRepoDelete={onRepoDelete}
                    loading={loading}
                    userProfile={userProfile}
                    getRepoStatus={getRepoStatus}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={75}>
                <div className="h-full ml-3">
                  <ChatMainPanel
                    selectedRepo={selectedRepo}
                    userProfile={userProfile}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </div>
  );
}