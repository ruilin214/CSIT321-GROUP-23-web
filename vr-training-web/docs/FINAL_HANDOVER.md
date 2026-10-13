> Headset-only release: see `docs/HEADSET_ONLY_UPDATE.md` (or `HEADSET_ONLY_UPDATE.md` from this folder) for the current feature set and setup. Earlier simulator references below describe previous versions and are not current features.

# Final Product & Documentation — working handover

Updated: 13 October 2026. Submission deadline supplied by the team: 23 October 2026, 11:00 pm (Sydney).

This is a handover draft based on the supplied code. It does not certify sponsor acceptance or replace the subject's complete submission rubric. Meeting minutes, signatures, screenshots and individual contributions must describe work that actually happened.

## 1. Product and verified scope

The website supports a five-step Ladder Inspection workflow, task ordering, mistake penalties, pause/resume, feedback, history and an educator dashboard. Browser workflow demo and Unity-generated results are distinguished by `source`. `trainingMode` records the current desktop/VR state and `usedVR` records whether VR was used during an attempt.

The uploaded package includes compiled Unity WebGL assets and integration scripts, but not the original editable Unity project. The supplied assets have not been rebuilt with these scripts. A rendered 3D scene does not establish headset support or successful training integration.

Local checks on this revision: 14 automated tests passed, production build passed, ESLint passed with one existing Toast Fast Refresh warning. Automated UI checks use jsdom; database checks use PGlite with a test Auth context. Real Supabase Auth, browser WebGL and headset operation remain unverified.

## 2. User manual

### Browser demonstration

1. Open the running website and choose **Trainee demo**. Demo data remains in this browser.
2. Select **Start Training → Ladder Inspection**.
3. Choose **Browser workflow demo**, then **Open Training → Start training**.
4. Remove the floor hazard, put on the safety helmet, engage the ladder locks, and inspect all five rungs. Rung 3 is damaged; the others are safe.
5. Confirm the final inspection. Feedback shows the score, duration and mistakes. Open History to review saved attempts.
6. Pause stops the training clock. Restart ends the old attempt and creates a new one. Exit saves an exited attempt.
7. Demo resume keeps completed tasks; any unfinished rung inspection must be repeated.

### Cloud trainee

Register using an email/password after cloud configuration is completed. Confirm the email if required, then sign in. Complete the same workflow and wait for **Training records synced**. A local demo identity never uploads records. A signed-in cloud identity can save browser-demo attempts, which remain labelled as demo results.

A sync failure retains records on that browser and shows a warning. Restore the connection and use **Refresh / retry sync**. Do not clear site data while records are pending. A second browser can read synced history after signing in with the same account. Cross-device continuation of an active attempt is not implemented.

### Educator

Use an administrator-configured educator account. The dashboard displays records allowed by the database's educator assignments. Filter results and export JSON; the current export includes all loaded records, not just the filtered view. Demo-data generation is available only in local demo mode. Cloud history deletion is not exposed in the website.

### Unity desktop simulator

Choose **Unity simulator** to open the current desktop 3D scene. No headset is required. For recorded training, the team must produce and validate a bridge-integrated desktop build; wait for **Unity simulator connected** before starting. If the bridge is missing, the scene can load but the website blocks recorded training. **VR headset** is a disabled placeholder for a separate future build. See `UNITY_SETUP.md` for scene integration. Re-entering a saved scene with progress requires a tested restore adapter; otherwise restart the attempt.

## 3. Installation and deployment

1. Install a Node version satisfying `package.json` engines. From the project root run `npm ci`.
2. To run local demo: `npm run dev`; open the printed URL. No cloud credentials are required for demo.
3. For cloud: create a Supabase project and execute `supabase/migrations/202610110001_training.sql` once in a new project. Existing projects already using this migration do not need to rerun it for this revision.
4. Copy `.env.example` to `.env.local`; replace the project URL and browser-safe publishable/anon key. Do not supply secret/service-role keys. Restart Vite after changes.
5. Configure Auth Site URL and redirect URLs for the actual application. Register two trainee test accounts and one educator account. Use the role/assignment SQL in the root README.
6. Run `npm test`, `npm run lint`, `npm run build`. The output is `dist/`; `npm run preview` serves it locally. Do not open HTML via a file URL.
7. Deploy at a domain root with HTTPS and the supplied platform route/header configuration. Verify direct refresh at `/history`, Unity asset MIME types, missing-asset handling, and the host's resource size limits. Environment values are compiled into the build, so rebuild after configuring them.
8. Keep the original Unity project and exported build as separate deliverables; do not present `unity-integration/` as a complete Unity source project.

## 4. Technical documentation

### Components and data path

React/TypeScript pages call the Zustand training store. The store validates training events and writes a paused snapshot to the per-account local cache and pending queue. A cloud account uses the Supabase SDK to save through `save_training_session(p_session jsonb)`. The server verifies ownership, recomputes the score and writes the session, task results and event logs atomically. History and dashboard query RLS-filtered session payloads.

Unity communicates through a same-origin iframe. The TypeScript bridge validates source window, origin, protocol and session identity. The host JS connects to C# through `.jslib` and Unity `SendMessage`. Commands are acknowledged and retried. Events now wait in FIFO order until acknowledged; an earlier local save failure prevents later task/finish events from overtaking it. This in-memory event queue is not durable across closing the iframe, browser crashes or forced reloads.

### Database and API

| Table/API | Purpose | Client access |
| --- | --- | --- |
| profiles | Auth-linked identity and role | Read own profile; admin sets roles |
| educator_assignments | Teacher-to-trainee visibility | Read own assignments |
| scenario_tasks | Ordered task IDs and scoring rules | Authenticated read |
| training_sessions | Attempt identity, status, revision, score and normalized JSON | Own/assigned read |
| task_results | Per-attempt task completion and mistakes | Through session visibility |
| interaction_logs | UUID events and timestamps | Through session visibility |
| save_training_session | Atomic validation and save | Authenticated RPC; owner only |
| trainingApi.list | Paginated payload retrieval | RLS-filtered, 500 rows/page |

The five required tasks each award 20 points; each mistake deducts 5 from the total, with a floor of zero. Completion and a score of at least 70 are required to pass. The server ignores duplicate/older revisions and rejects changes to finalized attempts. Client-reported task events do not independently prove real physical performance.

Commands: START, PAUSE, RESUME, EXIT, SETTINGS. Events: TASK_COMPLETED, MISTAKE, SESSION_FINISHED, PAUSED, XR_CHANGED. See `src/types/unityMessages.ts` for the exact schema. Current scenario ID is `ladder-inspection`. Credentials are never sent into the Unity iframe.

### Revision changes

- Unity host transmits one pending event at a time and ignores duplicate event acknowledgements.
- Unity rejection handling pauses locally without generating another rejectable pause event.
- Sync warnings are independent of scene/UI errors; successful ordinary actions cannot hide a failed upload, and successful cloud refresh cannot erase a scene error.
- Cached student records from a former educator role are filtered out when that identity is loaded as a trainee.
- Regression checks cover event ordering, duplicate acknowledgements, offline queuing/retry and role-sensitive cache visibility.

## 5. Required real-environment acceptance

Record actual results, tester, date, device/browser, deployment/build identifier and evidence for each row. Pending means not tested here, not passed.

| ID | Procedure and expected outcome | Current status |
| --- | --- | --- |
| A1 | Register, confirm email, sign in/out and reload; identity remains correct | Pending: real Supabase |
| A2 | Complete cloud-account demo, wait for sync, confirm session/tasks/logs in database | Pending: real Supabase |
| A3 | Sign in on second browser; saved score appears | Pending |
| A4 | Student B cannot read student A; assigned educator can; unassigned educator cannot | Pending: online RLS |
| A5 | Disconnect after login, complete attempt, reconnect; one completed result syncs | Pending: browser/network |
| A6 | Deployed page refresh works; Unity assets load without HTML/MIME errors | Pending: deployment |
| A7 | Integrated Unity handshake enables Start; real task updates website checklist | Pending: rebuilt Unity |
| A8 | Headset enters VR; tracking and controllers operate the intended scene | Pending: headset |
| A9 | Pause/VR exit blocks actual interactions; resume and restart are consistent | Pending: headset |
| A10 | Unity finishes; feedback matches actions; result uploads and is visible in History | Pending: integration |
| A11 | Measure initial load time and sustained frame rate on target hardware | Pending: hardware |

Do not mark this project as fully integrated or headset-ready until A7–A10 pass. Keep browser demo available for presentation while working on device integration.

## 6. Ownership and schedule proposal

| Date | Work | Suggested owner | Done when |
| --- | --- | --- | --- |
| Oct 13–15 | Configure cloud and run A1–A5 | Website/database lead | Online evidence captured |
| Oct 13–18 | Obtain headset, integrate original Unity project, rebuild | Unity lead + supervisor equipment support | A7–A9 pass |
| Oct 18–20 | Deploy and run complete Unity-to-database workflow | Integration pair | A6 and A10 pass |
| Oct 20–22 | Fix critical defects; complete manuals, evidence and contribution records | All members | Reproducible handover ready |
| Oct 23 | Verify final package and submit to required recipients | Coordinator | Submission receipt retained before 11 pm |

Role assignments are proposed, not evidence of completed individual work.

## 7. Records the team must supply

For each genuine meeting record: date, attendees, agenda, decisions, assigned actions, deadlines, follow-up outcome and link to evidence. Do not invent retrospective meetings.

For each contributor: name, specific implemented/documented work, file paths, commit/PR references, test or document evidence, reviewer and completion date. Avoid percentages that cannot be evidenced.

Final package checklist: website source and lockfile; environment example without secrets; database migration; production web build; original Unity project with Packages/ProjectSettings/Assets and relevant licences; integrated export; user/install/technical manuals; executed testing report with screenshots; meeting/contribution evidence; deployment URL and authorized access instructions; known limitations; any additional items in the full assessment rubric. Submit documentation to the coordinator and sponsor/supervisor as required by the supplied assessment excerpt.
