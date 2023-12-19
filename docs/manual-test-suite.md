# Manual Test Suite

These are tests which are a little more difficult to do in an automated fashion (usually involving using an actual database/auth method). Some I would recommend doing as an "establishment test suite" whenever you deploy the system (fresh or as a new version) to ensure it's all set up properly. Others are more worthwhile to do during development, to ensure features are working as expected.

## Establishment Test Suite

| Test Goal | Test Process | Expected Results |
| --- | --- | --- |
| Ensure Backend is accessible | Make a GET request to `/api/implants` | Some response (probably a 403) |
| Ensure frontend is accessible | Navigate to the CERBERUS URL in browser | Front page loads |
| Ensure login works | Log in via the CERBERUS frontend | Login is successful and implants list populates |
| Ensure admin page is ready to go | After logging in as an admin account, go to the admin page | Task types list populates properly |
| Ensure edits in the database take properly | As admin, go to admin page, add a new task type (then delete it!) | Task type gets created, list updates, and on deletion the task type disappears |

## Manual Dev-Tests Suite

Do these as part of the QAT phase at least before every major release. Do these in a NON-PRODUCTION environment!

| Test Goal | Test Process | Expected Results |
| --- | --- | --- |
| All establishment tests | As above | As above |
| Login - missing username | Attempt login without a username | Error returned |
| Login - missing password | Attempt login without a password | Error returned |
| Login - wrong credentials | Attempt login with incorrect username or password | Error returned |
| Implants - Viewable | Select an implant you can view | Tasks list populates |
| Implants - beaconing | Send a beacon, either from a real implant, or via a tool such as Insomnia | Implant appears on the list |
| Implants - deleteable | As an admin, delete an implant | Implant is removed from the list |
| Tasks - creatable | Select an implant you have operator rights on, then add a task | Task appears correctly on the queue |
| Tasks - editable | Select an implant you have operator rights on, then edit a task | Task appears is modified on the queue as appropriate |
| Tasks - deleteable | Select an implant you have operator rights on, then delete a task | Task disappears from the queue |
| Task types - creatable | As admin, go to admin page and create a new task type | Task type appears correctly on the list |
| Task types - deleteable | As admin, go to admin page and delete a task type | Task type disappears from the list |
| Task types - create requires admin perms | As *non*-admin, go to admin page and attempt to create a task type | Task types list is populated, but cannot create a new one |
| Users - add as an admin | As admin, go to admin page, search for a non-admin user, make them an admin | Other user should be able to undertake admin actions |
| Users - remove as an admin | As admin, go to admin page, search for a admin user, make them non-admin | Other user should not be able to undertake admin actions any more |
| Groups - create | As admin, go to admin page, create a new group | If DB Auth, group is created. If AD auth, error. |
| Groups - remove | As admin, go to admin page, delete group | If DB Auth, group is deleted. If AD auth, error. |