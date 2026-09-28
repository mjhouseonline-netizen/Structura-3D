/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { PageTabBar } from './components/PageTabBar';
import { LeftToolbar } from './components/LeftToolbar';
import { ThreeViewport } from './engine/ThreeViewport';
import { LayoutSheetView } from './components/LayoutSheetView';
import { RightPanel } from './components/RightPanel';
import { BottomBar } from './components/BottomBar';
import { MobileToolDock } from './components/MobileToolDock';
import { HelpCentreModal } from './components/HelpCentreModal';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { InteractiveGuidedTour } from './components/InteractiveGuidedTour';
import { EmptyWorkspaceHero } from './components/EmptyWorkspaceHero';
import { useModelStore, modelActions } from './state/useModelStore';

export default function App() {
  const { theme, pages, activePageId } = useModelStore();

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const is2DSheet = activePage?.type === '2d-layout';

  // Load autosaved project from localStorage on initial mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('structura_3d_project');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
          modelActions.loadProject(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load autosaved project:', e);
    }
  }, []);

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden font-sans ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Application Bar */}
      <TopBar />

      {/* Pages & Sheets Tabs Bar (Switch between 3D spaces and 2D LayOut sheets) */}
      <PageTabBar />

      {/* Main Workspace: Left Tools + 3D Canvas / 2D LayOut Sheet + Right Collapsible Panel */}
      <main className="flex-1 flex overflow-hidden relative">
        {!is2DSheet && <LeftToolbar />}

        {/* Viewport Centerpiece: 3D Scene OR 2D Architectural LayOut */}
        <section className="flex-1 relative h-full w-full overflow-hidden bg-slate-950">
          {is2DSheet ? <LayoutSheetView /> : <ThreeViewport />}

          {/* Empty Workspace Getting Started Card */}
          {!is2DSheet && <EmptyWorkspaceHero />}
        </section>

        {!is2DSheet && <RightPanel />}
      </main>

      {/* Bottom Bar: Status hints, Units, Snapping toggles & VCB Measurement Entry */}
      {!is2DSheet && <BottomBar />}

      {/* Mobile Touch Tool Dock (Floating for Phones/Tablets) */}
      {!is2DSheet && <MobileToolDock />}

      {/* Interactive 13-Step Beginner Tutorial ("Build Your First Room") */}
      <InteractiveTutorial />

      {/* Comprehensive In-App Help & Learning Centre */}
      <HelpCentreModal />

      {/* Interactive In-Interface Guided Tour */}
      <InteractiveGuidedTour />
    </div>
  );
}
