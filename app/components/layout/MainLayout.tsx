import { Sidebar } from "./Sidebar";
import { User } from "~/types/user";
import { Score } from "~/types/score";
import { SidebarType } from "~/types/layout";
import styles from "~/styles/components/layout/MainLayout.module.css";

export interface MainLayoutProps {
  children: React.ReactNode;
  user: User | null;
  recentScores: Score[];
  sidebarType?: SidebarType;
  hideSidebar?: boolean;
}

export function MainLayout({
  children,
  user,
  recentScores,
  sidebarType = "profile",
  hideSidebar = false,
}: MainLayoutProps) {
  return (
    <main className={styles.main}>
      <div className={hideSidebar ? "" : styles.pageLayout}>
        <div className={styles.feed}>{children}</div>

        {!hideSidebar && (
          <Sidebar
            user={user}
            sidebarType={sidebarType}
            recentScores={recentScores || { scores: [] }}
          />
        )}
      </div>
    </main>
  );
}
