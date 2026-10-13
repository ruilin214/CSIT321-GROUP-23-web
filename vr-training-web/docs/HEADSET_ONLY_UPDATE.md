# Headset-only release — 13 October 2026

## What changed
- Welcome text and header use `full_name` from Supabase Auth user metadata. Existing accounts without a registered name show their email instead of the UUID. Account IDs remain unchanged for database ownership.
- Removed local Demo login, browser workflow simulation, desktop Unity scene, generated demo-data controls and new simulated attempts.
- Registration, cloud login, sign-out, history, educator dashboard, accessibility preferences and training-record synchronization remain.
- Old training records are retained and their original simulation labels remain visible. This update does not delete database data or promote simulated results to headset results.
- No account-management page has been added, in line with the earlier instruction to pause that feature.

## Headset build still required
The old compiled Unity scene is NOT included. It was a desktop simulation, not a verified headset build. This release contains the website and integration scripts, not a working VR executable.

The training briefing shows **Headset build not installed** until a real integrated WebXR Unity build is installed. Merely changing the environment variable does not make a desktop export support VR.

### Unity owner
1. In the original Unity project, configure the chosen WebXR exporter and actual headset/controller interactions.
2. Import `unity-integration/Assets`. Connect the scene adapter to real task interactions; connect exporter enter/exit callbacks to `WebXRTrainingManager`.
3. Rebuild with the updated `TrainingEventBridge.cs`. START now prepares a paused attempt; RESUME rejects desktop mode. The bridge tracks actual enter/exit VR callbacks and reports XR state after preparing the attempt.
4. Export the genuine headset build into `public/headset`, including `index.html` and `Build/`. The host communicates with the React app on the same origin.
5. The reusable host/bridge template is in `unity-integration/WebXRHostTemplate`. Adapt its loader/resource references to the genuine export. Load `training-bridge.js`, call `TrainingHost.attach(instance)` after Unity instantiation, following `UNITY_SETUP.md`.
6. After the genuine build is installed, set `VITE_HEADSET_BUILD_READY=true` in `.env.local`. Rebuild for deployment and serve over HTTPS.
7. Open the website in the headset, open training, wait for bridge readiness, click **Prepare headset**, enter VR using the exporter's VR control, then click **Start training**. Entering VR before preparation is also supported by the updated bridge's stored XR state.
8. Test tracking, controllers, pause, resume, VR exit, restart, completion, score saving and cross-device history before claiming headset delivery.

## Installation
Copy your existing `.env.local` next to `package.json`. Keep the existing Supabase URL/key. Add `VITE_HEADSET_BUILD_READY=false` while the real build is unavailable. Run `npm ci` and `npm run dev`. A signed-in account is required. No new SQL migration is needed for registered-name display.

## Validation
14 automated tests passed, production build passed, ESLint has no errors and one existing Toast Fast Refresh warning. Tests cover registered-name display, removal of demo entry points, blocked uninstalled headset build, logout, desktop-event rejection, bridge retries, database policies, scoring and cloud sync. Unity C# scripts could not be compiled or run because the original Unity project and headset are unavailable. Browser screenshot QA and real cloud/device verification remain pending.
