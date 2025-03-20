import { Sidebar } from "./Sidebar";
import { MainLayoutProps } from "~/types/layout";
import styles from "~/styles/components/layout/MainLayout.module.css";


export function MainLayout({ 
  children, 
  user, 
  userStats, 
  recentScores,
  sidebarType = "profile",
  hideSidebar = false 
}: MainLayoutProps) {
  return (
    <main className={styles.main}>
      <div className={hideSidebar ? "" : styles.pageLayout}>
        <div className={styles.feed}>
          {children}
        </div>
        
        {!hideSidebar && (
          <Sidebar 
            user={user} 
            userStats={userStats || null} 
            sidebarType={sidebarType} 
            recentScores={recentScores || { scores: [] }}
          />
        )}
      </div>
    </main>
  );
}
