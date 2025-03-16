import { User, UserStats } from "~/types/user";
import { ScoreList } from "~/types/score";

type sidebarType = "profile" | "recentScores";

export interface HeaderProps {
  user: User;
}

export interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
  userStats: UserStats;
  recentScores: ScoreList;
  sidebarType: sidebarType;
  hideSidebar?: boolean;
}

export interface SidebarProps {
  user: User;
  userStats: UserStats;
  sidebarType: sidebarType;
  recentScores: scoreList;
}
