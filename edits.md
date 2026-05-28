# EDITS.md

Read this file and apply every fix listed. Read each affected file before editing. Do not break anything that's working.

---

## JOURNAL

- History button is not working. Debug the click handler and routing/state — it should open or navigate to the past entries view.
- Past entries: add a Delete button to each entry. Clicking delete opens a confirmation modal ("Are you sure? This cannot be undone."). On confirm, entry is deleted from DB and removed from the list.

## STUDY TRACKER

- Monthly goal is not being saved. Debug the save handler and API call — check that PUT /api/study/goal is being called correctly and the response is handled. Verify the goal persists on page refresh.

## TASKS

- Tasks allocated to today are not appearing in the Dashboard Today's Tasks section. Debug the GET /api/tasks/today endpoint and the Dashboard data fetch — ensure allocated tasks for the current date are returned and rendered.
- Add the ability to mark a task as complete. Each task card should have a completion toggle (checkbox or button). Marking complete updates status to "Done" and reflects in both backlog and weekly board.

## OVERALL

- Logout must redirect to the landing page (/), not /login. Fix the logout handler in AuthContext and any logout buttons across the app (sidebar, topbar).
