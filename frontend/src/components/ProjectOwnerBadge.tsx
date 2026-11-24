import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import type { Project } from "../lib/types.ts";
import useTranslations from "../hooks/useTranslations.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import { getProjectOwner } from "../lib/projectOwner.ts";

// Shows the project's owner, with an icon telling whether the logged-in user
// owns the project (crown) or is only a member of it (group).
export default function ProjectOwnerBadge({ project }: { project: Project }) {
  const translation = useTranslations().projectList;
  const { appUser } = useAppUser();

  const owner = getProjectOwner(project);
  const isOwner = owner !== undefined && owner.id === appUser?.id;
  const roleText = isOwner ? translation.youAreOwner : translation.youAreMember;

  return (
    <span className="inline-flex min-w-0 items-center gap-2" title={roleText}>
      <FontAwesomeIcon
        icon={isOwner ? faCrown : faUserGroup}
        className={isOwner ? "text-yellow-600" : "text-fisma-gray"}
        aria-hidden="true"
      />
      <span className="sr-only">{roleText}:</span>
      <span className="truncate">{owner?.username ?? "-"}</span>
    </span>
  );
}
