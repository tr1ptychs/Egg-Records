import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { getUserAuth , logout } from "~/utils/auth.server";
import { getUserAchievements } from "~/models/user.server.ts"
import { db } from "~/utils/db.server";
import "~/styles/settings.css";

export const meta = () => {
  return [{ title: "Account Settings" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserAuth(request);
  if (!user) return redirect("/login");
  
  // Get current privacy settings
  const userSettings = db.prepare(`
    SELECT private FROM user_settings WHERE userId = ?
  `).get(user.id) || { private: 0 };

  // Get user achievements (if exists and insert defaults)
  const achievements = db.prepare(`
    SELECT grizzBadge, bigRun, eggstraWork FROM user_achievements WHERE userId = ?
  `).get(user.id) || { grizzBadge: "no-display", bigRun: "no-display", eggstraWork: "no-display" }

  // Convert SQLite integer (0 or 1) to JavaScript boolean
  return json({ 
    user, 
    isPrivate: Boolean(userSettings.private), 
    achievements 
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUserAuth(request);
  if (!user) return redirect("/login");
  
  const form = await request.formData();
  const action = form.get("action");
  
  if (action === "updatePrivacy") {
    const isPrivate = form.get("isPrivate") === "true";
    const privateValue = isPrivate ? 1 : 0;
    
    // Default is public (private = 0)
    if (isPrivate) {
        // Only create/update if user wants privacy (non-default)
        const existingSettings = db.prepare(`
          SELECT * FROM user_settings WHERE userId = ?
        `).get(user.id);
        
        if (existingSettings) {
          db.prepare(`UPDATE user_settings SET private = ? WHERE userId = ?`)
            .run(privateValue, user.id);
        } else {
          db.prepare(`INSERT INTO user_settings (userId, private) VALUES (?, ?)`)
            .run(user.id, privateValue);
        }
    } else {
      // If returning to default (public), remove the entry if it exists
      db.prepare(`DELETE FROM user_settings WHERE userId = ?`).run(user.id);
    }
    
    return json({ 
      action: "updatePrivacy",
      success: true, 
      message: "Privacy settings updated successfully" 
    });
  }

  if (action === "deleteAccount") {
    const confirmation = form.get("confirmation");
    
    if (confirmation !== user.username) {
      return json({ 
        action: "deleteAccount",
        success: false, 
        message: "Username confirmation did not match" 
      }, { status: 400 });
    }
   
    // Delete user data in this order to respect foreign key constraints
    db.prepare(`DELETE FROM scores WHERE userId = ?`).run(user.id);
    db.prepare(`DELETE FROM user_settings WHERE userId = ?`).run(user.id);
    db.prepare(`DELETE FROM users WHERE id = ?`).run(user.id);
    db.prepare(`DELETE FROM user_achievements WHERE userId = ?`).run(user.id);
    
    // Log the user out
    return logout(request);
  }

  if (action === "updateAchievements") {
    const bigRun = form.get("bigRun") || "no-display";
    const eggstraWork = form.get("eggstraWork") || "no-display";
    const grizzBadge = form.get("grizzBadge") || "no-display";

    if (!bigRun|| !eggstraWork|| !grizzBadge) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingAchievements = await getUserAchievements(user.id)
    if (existingAchievements) {
      if (existingAchievements.grizzBadge == grizzBadge && 
          existingAchievements.eggstraWork == eggstraWork && 
          existingAchievements.bigRun == bigRun) {
        return json({ 
          action: "updateAchievements",
          success: true, 
          message: "Achievements are unchanged" 
        });
      } else if (grizzBadge == "no-display" &&
          eggstraWork == "no-display" &&
          bigRun == "no-display") {
        db.prepare(`DELETE FROM user_achievements WHERE userId = ?`).run(user.id);
      } else { 
        db.prepare(`
          UPDATE user_achievements SET 
          grizzBadge = ?, bigRun = ?, eggstraWork = ? 
          WHERE userId = ?
        `).run(grizzBadge, bigRun, eggstraWork, user.id);
      }
    } else {
      db.prepare(`
        INSERT INTO user_achievements
        (userId, grizzBadge, bigRun, eggstraWork) VALUES (?, ?, ?, ?)
      `).run(user.id, grizzBadge, bigRun, eggstraWork);
    }

    return json({ 
      action: "updateAchievements",
      success: true, 
      message: "Achievements updated successfully" 
    });
  }
  
  return json({ success: false, message: "Invalid action" }, { status: 400 });
}

export default function Settings() {
  const { user, isPrivate, achievements } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [confirmation, setConfirmation] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isSubmitting = navigation.state === "submitting";
  
  return (
    <main className="settings-container">
      <div className="settings-card">
        <div className="settings-header">
          <h1 className="settings-title">Account Settings</h1>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Achievements</h2>
          <p className="section-description">
            Set your achievements here to display on your profile card.
          </p>

          <Form method="post" className="achievements-form">
            <input type="hidden" name="action" value="updateAchievements" />
            <div className="form-group">
              <label htmlFor="bigRun" className="select-label">
              <select 
                name="bigRun"  
                className="select-input"
                defaultValue={achievements.bigRun}
                required>
                <option name= "no-display" value="no-display">Do not display</option>
                <option value="normal">Normal</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
              </select>
              <span className="select-text">Big Run</span>
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="eggstraWork" className="select-label">
              <select 
                name="eggstraWork"
                className="select-input" 
                defaultValue={achievements.eggstraWork}
                required> 
                <option value="no-display">Do not display</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
              </select>
              <span className="select-text">Eggstra Work</span>
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="grizzBadge" className="select-label">
              <select 
                name="grizzBadge" 
                className="select-input" 
                defaultValue={achievements.grizzBadge}
                required>
                <option value="no-display">Do not display</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
              </select>
              <span className="select-text">Grizzco Badge</span>
              </label>
            </div>
            
            <button 
              type="submit" 
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Achievements"}
            </button>
            {actionData?.action === "updateAchievements" && actionData?.success && (
              <div className="success-message">{actionData.message}</div>
            )}
            {actionData?.action === "updateAchievements" && !actionData?.success && (
              <div className="error-message">{actionData.message}</div>
            )}
          </Form>
        </div> 
        
        <div className="settings-section">
          <h2 className="section-title">Privacy</h2>
          <p className="section-description">
            Setting your profile to private means your scores won&apos;t appear in the homepage feed,
            and your scores will only be visible to you. Other users will still be able to view your discord
            picture and display name on your user page.
          </p>
          
          <Form method="post" className="privacy-form">
            <input type="hidden" name="action" value="updatePrivacy" />
            <div className="form-group">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  name="isPrivate" 
                  defaultChecked={isPrivate}
                  value="true"
                  className="toggle-input" 
                />
                <span className="toggle-text">Make my profile private</span>
              </label>
            </div>
            
            <button 
              type="submit" 
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Privacy Settings"}
            </button>
          </Form>
          
          {actionData?.action === "updatePrivacy" && actionData?.success && (
            <div className="success-message">{actionData.message}</div>
          )}
        </div>
        
        <div className="settings-section danger-zone">
          <h2 className="section-title">Danger Zone</h2>
          
          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="delete-button"
            >
              Delete Account
            </button>
          ) : (
            <div className="delete-confirm">
              <p className="warning-text">
                This action is permanent. All your scores and profile data will be deleted.
                To confirm, please type your username <strong>{user.username}</strong> below.
              </p>
              
              <Form method="post" className="delete-form">
                <input type="hidden" name="action" value="deleteAccount" />
                
                <div className="form-group">
                  <label htmlFor="confirmation">Username Confirmation:</label>
                  <input
                    id="confirmation"
                    name="confirmation"
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="Type your username to confirm"
                    className="confirm-input"
                  />
                </div>
                
                <div className="button-group">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setConfirmation("");
                    }}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={confirmation !== user.username || isSubmitting}
                    className="confirm-delete-button"
                  >
                    {isSubmitting ? "Deleting..." : "Permanently Delete Account"}
                  </button>
                </div>
              </Form>
              
              {actionData?.action === "deleteAccount" && !actionData?.success && (
                <div className="error-message">{actionData.message}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
