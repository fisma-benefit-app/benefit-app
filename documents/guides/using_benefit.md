# Use Benefit

Use this guide to create a FiSMA calculation, understand the result, manage versions and access, and export reports. It describes the current interface. English control names are used below; the app also has Finnish translations.

## Before you begin

Open the service linked from the [README](../../README.md#services-and-environments) and sign in with the account provided to you. Accounts are created by an administrator; there is no public self-registration workflow.

A successful first session is: create a project → add and classify a component → enter its inputs and completion → save → inspect a report.

## FiSMA 1.1 Method Overview

Function point analysis measures the functional size of software. That measurement can support productivity analysis and workload estimation. Several function point analysis methods exist; Benefit uses **FiSMA 1.1**.

In FiSMA 1.1, each user-relevant function is classified into a function category and function type, and entered as a row in a table. Each function has a unique identifier and the measurable attributes required by its category/type:

- Data elements.
- Read references.
- Write references.
- Operations.
- Function factor.

Examples of functionality to classify include a list view on a web page, a CSV report, an integration, or data storage represented by a database table. The method and your analysis conventions determine how to identify and count these; the application does not infer the requirements for you.

Technical features such as internal logging and developer utilities, and quality-related features such as caching, are not counted as additional user functions. Functional size measures functional requirements rather than the technical work needed to implement them.

In Benefit, these rows are called **functional components**. The [component workflow](#add-and-classify-a-component) below explains how to enter them. For the implementation of the point formulas and totals, see the [calculation reference](../references/centralized_calculations.md).

The [northernSCOPE™ concept](../../README.md#northernscope-concept) provides the broader FiSMA context retained in the project README.

## Understand your access

| Situation | What you can do |
| --- | --- |
| You created the project | You are its owner. You can edit the latest version and manage sharing. |
| Someone shared it with you | You have view-only access to the calculation. You can read it and export available reports/CSV. |
| You opened an archived version | Read and export the recorded calculation; edit the latest version instead. |
| You opened comments on the latest version | Project participants can add, edit, and delete comments. Comment edits are not restricted to their original author. |

Account administration and project ownership are separate. If controls are unavailable, first check which project version you opened and whether you own it.

## Create or open a calculation

1. From the project list, choose the new-project action.
2. Choose creation of a new project and enter a descriptive name.
3. Open the created project. A new calculation starts at version 1 and belongs to you.

The name must not conflict with a project you already have access to. Use a name that identifies the analysis rather than adding a version suffix yourself; Benefit manages version numbers separately.

The creation dialog also supports CSV import. Use a Benefit-compatible export as the starting format and review imported components and totals. Do not assume an arbitrary spreadsheet CSV follows the application's schema.

### Start from a quick calculation

The Quick Calculation view estimates size from counts and average inputs for the functional categories. Review the defaults and any averages you change. Creating a project from it produces normal functional components that you can then inspect and refine. It is a starting estimate, not a substitute for validating the requirements behind each item.

## Add and classify a component

In the latest project version that you own, choose **New Functional Component**. Give it a meaningful title and description, choose its functional class, then choose a type where that class needs one.

The seven classes cover:

- Interactive end-user navigation and query.
- Interactive end-user input.
- Non-interactive end-user output.
- Interfaces to other applications.
- Interfaces from other applications.
- Data storage.
- Algorithmic or manipulation services.

Use the choices offered for the selected class. The input fields and type options depend on that choice. Enter the relevant data elements, read/write references, or operations according to the method and your requirements. Changing a class can reset parameters that no longer apply.

### Completion and totals

Completion expresses how far the functionality has progressed. A component can have a nonzero functional size while contributing zero completed points when its completion is zero. Setting completion to 100% is not a remedy for an unexpected functional size.

Distinguish the size of the functionality from the points weighted by completion. Review the summary and report labels before comparing figures. For implementation details, see the [calculation reference](../references/centralized_calculations.md); externally checked worked examples are planned for that reference.

### Multi-layer architecture

For components that support MLA, open their subcomponent controls and review the layer-specific values. MLA distributes functionality across layers; child rows are linked to their parent and some fields are read-only because the parent governs them.

Review layer summaries as well as the overall result. Do not count a technical layer as an additional user requirement merely because it exists in the software architecture.

## Work with a large calculation

Use search to find components by title. Collapse components/descriptions or use compact view to reduce visual clutter. These controls change presentation rather than the stored calculation.

An owner can reorder components in the latest version. Clear the search filter before reordering; movement is disabled while a title search narrows the visible list. Display order is independent of component IDs and links to a previous version.

## Save and resolve conflicts

Edits are normally autosaved after about five seconds of inactivity. Use **Save** when you want an explicit save, and check the save notification before closing or switching work. If a save fails, the presence of your edit on screen does not prove that it reached the server.

If another tab or window saved first, Benefit pauses autosaving and offers a choice:

- **Load saved version** discards this tab's unsaved changes and loads the stored calculation.
- **Keep my changes** deliberately replaces the other save with this tab's calculation when editing is still permitted.

Compare or preserve any important unsaved information before choosing. If the project was archived elsewhere, you must open the current saved/latest state; keeping edits cannot make an archived calculation editable. A conflict during archiving also offers **Cancel archiving**.

For a network failure, check the connection and save status before retrying or reloading. Avoid making simultaneous changes to the same project from multiple windows when possible.

## Create a version history

Use **Archive as version** on the latest owned project to preserve a snapshot and continue in a new version. Confirm the action and use the version selector to inspect the history afterward.

The older project version becomes read-only. The new version gets copied components and retains access roles, while internal links let reports compare components across versions. Renaming the latest calculation also renames its version history. Matching names do not link independently created projects.

A duplicate is different: the project-list duplicate action creates a separate calculation at version 1 with a new name, owned only by you. Use duplication when you want an independent starting point rather than another version of the same calculation.

## Share and comment

From the project list, use **Share** on a project you own. Enter an existing account's username. The new member receives view-only access to that calculation and its version history; this action does not make them an owner.

Removing access applies across the project's existing versions. Avoid leaving a shared project without an owner; the current implementation has an open [ownership-preservation issue](https://github.com/fisma-benefit-app/benefit-app/issues/1081).

Open **Comments** for project discussion and **Calculation report comments** for a separate set of report-related comments. Project participants can add, edit, or delete either type on the latest version, including comments written by another participant. In the interface both panels are read-only on archived versions. Each comment belongs to the selected project version; comments are not copied to a new version.

**Report calculation notes** are a separate project field included in the overview report. Calculation report comments are not currently included in either PDF report.

## Prepare and export a report

1. Confirm the selected project version and save status.
2. Review **Measurement Date**, **Report contact details**, and **Report calculation notes** where you can edit them.
3. Use **Overview summary report** for the high-level PDF, or **Calculation report** for the detailed PDF in the calculation summary.
4. Use the CSV export control when you need the calculation data in a spreadsheet-compatible format.
5. Open the downloaded file and check the project/version, report metadata, and important totals before sharing it.

Exports describe the selected version. View-only access permits available exports; it does not permit changes to calculation inputs. PDF exports are generated in your browser, so check the browser's downloads and any reported export failure.

## Sessions and passwords

A normal login lasts up to 24 hours; remembered sessions can last up to 30 days. Use the session-extension action when it is offered. A login cannot be extended indefinitely beyond 30 days from the original sign-in.

Changing your password signs out existing sessions, including the current one. Sign in again with the new password. Signing out in one tab clears the shared login for other tabs using the same deployment.

## If something does not work

| Symptom | What to check |
| --- | --- |
| You cannot edit or save | Check ownership and whether this is the latest version. |
| You cannot find a project | Check the account/deployment and whether access was removed. |
| The number is unexpected | Check class/type, applicable inputs, completion, selected version, and whether you are comparing total size or completed points. |
| A save conflict appears | Compare the two states and choose deliberately; do not repeatedly force a stale save. |
| An export is missing | Check downloads, the selected project, and the export notification. |
| Login or session extension fails | Sign in again; if it persists, report the time, environment, and visible error. |

When reporting a problem, include the environment, steps, expected result, actual result, and relevant project/version only if appropriate to share. Exclude passwords, tokens, and confidential calculation content. Use [GitHub issues](https://github.com/fisma-benefit-app/benefit-app/issues) or the project's [contact](../../README.md#contact).
