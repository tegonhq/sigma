import { ResizablePanel, ResizablePanelGroup } from "@tegonhq/ui";
import { observer } from "mobx-react-lite";
import * as React from "react";

interface LayoutProps {
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

export const AppLayoutChild = observer(({ children }: LayoutProps) => {
  return (
    <div className="h-[100vh] w-[100vw] flex">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          collapsible={false}
          order={2}
          className="flex items-center justify-center pl-0"
        >
          <div className="w-full">{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
});
