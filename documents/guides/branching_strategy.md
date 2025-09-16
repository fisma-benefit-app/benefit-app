# Branching strategy guide

This document further explains the branching strategy used inBenefit application's development and CI/CD pipeline.

The goal of the strategy is to simplify development work when multiple developers are working on the same repository, avoid merge conflicts, and proactively prevent deployment-related issues. Branches named according to predefined schemas also tie development work more closely to project management, make branches more understandable to other developers, and eliminate the need to ponder what the branch should be named.

## Branching strategy flow

Here, the branching strategy has been visualized as an image.

<details>
<summary><b>Click here to view the branching strategy as an image</b></summary>
<img src="../img/images_for_guides/branching%20strategy.png" width="785" height="752"/>
</details>

## Implementing the strategy

The strategy is implemented as outlined below:

1) At the beginning of the sprint, a sprint-specific branch is created from the main branch, named `sprint/X`, where “X” represents the sprint number. For example, for sprint number 9, the branch would be named `sprint/9`. This sprint branch acts as a “collection branch” for all development work done during the sprint. The sprint branch is pushed to GitHub, from where other developers can fetch it into their local development environments.

2) Developers create local development branches from the sprint branch using, for example, the `git switch -c` command. The naming schema for development branches is `issue/#XXX-description`, where “#XXX” is the issue number (e.g., #219 in GitHub project management), and “description” is the issue title (e.g., “Clean up GitHub documentation”). So the branch name would be `issue/219-clean-up-github-documentation`. Each issue on the project board should have its own dedicated branch.

3) When a development branch is ready to be merged into the sprint branch, it is pushed to GitHub as a new branch, and a pull request is opened for review by another developer. When each development branch contains changes related to only one issue, it’s easier to keep track of what has been done. It also makes the reviewer’s job easier, as pull requests remain reasonably sized and focused on a single issue.

4) After the pull request is approved, the development branch can be merged into the sprint branch. The development branch is automatically deleted from GitHub.

5) Steps 2–4 are repeated until the end of the sprint.

6) At the end of the sprint, all changes collected in the sprint branch are merged into the `main` branch via a pull request.

7) Deployment can be done from the `main` branch to bring the sprint’s changes into the production environment (Heroku).

8) At the beginning of the next sprint, a new sprint branch is created from `main`, and development work begins again.

## Notes

A few notes regarding the strategy:

1) **`main` is sacred** – no development branches should be pushed directly to `main`! This is also enforced through GitHub repository rules. The `main` branch should always reflect the version currently in production. The only exceptions to this rule are hotfixes, which are made directly to the production version. Hotfixes are currently not implemented in the branching strategy.

2) A staging environment could be added to the strategy – essentially a testing environment that mirrors the production code but hasn’t been released yet. Currently, such an environment is not in use. The branch that would be pushed to a staging environment would be the current sprint branch.

3) Since the sprint branch is continuously updated with changes made by developers and merged via pull requests, it’s important to regularly pull the latest version of the sprint branch into the local environment before creating a new development branch.

4) The strategy is not final – it will be adjusted as needed based on experiences gained during development. However, it provides a solid foundation for starting systematic development work involving multiple developers working simultaneously.