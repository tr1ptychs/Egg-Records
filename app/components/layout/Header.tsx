import { useState } from "react";
import { Form, Link } from "@remix-run/react";
import { Button } from "~/components/ui/Button";
import { User } from "~/types/user";
import styles from "~/styles/components/layout/Header.module.css";

export function Header({ user }: { user: User | null }) {
  const [navExpanded, setNavExpanded] = useState(false);

  const toggleNav = () => {
    setNavExpanded(!navExpanded);
  };

  return (
    <header className={styles.header}>
      <nav className={navExpanded ? styles.navExpanded : styles.nav}>
        <div className={styles.navExpandedHeader}>
          <div className={styles.logo}>
            <Link className={styles.logo} to="/">
              Egg Records
            </Link>
          </div>
          <div
            className={`${styles.hamburgerMenu} ${
              navExpanded ? styles.hamburgerActive : ""
            }`}
            onClick={toggleNav}
            role="presentation" // fixes error
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div
          className={`${styles.navAuth} ${
            navExpanded ? styles.expandedNavAuth : ""
          }`}
        >
          {user ? (
            <>
              <div
                className={`${styles.navLinks} ${
                  navExpanded ? styles.expandedNavLinks : ""
                }`}
              >
                {user && (
                  <Link to={`/u/${user.username}`} className={styles.navLink}>
                    My Profile
                  </Link>
                )}
                {user && (
                  <Link to="/my-scores" className={styles.navLink}>
                    My Scores
                  </Link>
                )}
                <Link to="/submit" className={styles.navLink}>
                  Submit
                </Link>
                {user && (
                  <Link to={`/settings`} className={styles.navLink}>
                    Settings
                  </Link>
                )}
              </div>
              <Form action="/auth/logout" method="post">
                <button type="submit" className={styles.logoutButton}>
                  Logout
                </button>
              </Form>
            </>
          ) : (
            <Button href="/auth/discord" variant="discord">
              Sign in with Discord
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
