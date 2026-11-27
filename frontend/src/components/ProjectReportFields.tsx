import { Dispatch, MutableRefObject, SetStateAction } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { enUS, fi } from "date-fns/locale";
import useLanguage from "../hooks/useLanguage.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import { Project } from "../lib/types.ts";

type ProjectReportFieldsProps = {
  project: Project | null;
  setProject: Dispatch<SetStateAction<Project | null>>;
  // Updated together with the state so auto-save sees the edit straight away.
  projectRef: MutableRefObject<Project | null>;
  canEdit: boolean;
  loadingProject: boolean;
  debouncedSaveProject: () => void;
};

function isoDateToLocalDate(isoDate: string): Date {
  const parts = isoDate.split("-").map((p) => Number(p));
  if (parts.length !== 3) {
    return new Date(isoDate);
  }

  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

function localDateToIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// The calculation date, contact details and notes that go into the reports.
export default function ProjectReportFields({
  project,
  setProject,
  projectRef,
  canEdit,
  loadingProject,
  debouncedSaveProject,
}: ProjectReportFieldsProps) {
  const translation = useTranslations().projectPage;
  const { language } = useLanguage();

  const updateField = <K extends keyof Project>(key: K, value: Project[K]) => {
    setProject((prev) => {
      if (!prev || !canEdit) return prev;
      const updated = { ...prev, [key]: value };
      projectRef.current = updated;
      return updated;
    });

    if (canEdit) {
      debouncedSaveProject();
    }
  };

  return (
    <>
      <div className="mt-2">
        <label
          htmlFor="report-calculation-date"
          className="block text-left font-medium"
        >
          {translation.calculationDate}
        </label>
        <DatePicker
          key={language}
          id="report-calculation-date"
          selected={
            project?.calculationDate
              ? isoDateToLocalDate(project.calculationDate)
              : null
          }
          onChange={(date: Date | null) => {
            updateField(
              "calculationDate",
              date ? localDateToIsoDate(date) : null,
            );
          }}
          locale={language === "fi" ? fi : enUS}
          dateFormat={language === "fi" ? "dd/MM/yyyy" : "MM/dd/yyyy"}
          previousMonthAriaLabel={translation.datePicker.previousMonth}
          previousMonthButtonLabel={translation.datePicker.previousMonth}
          nextMonthAriaLabel={translation.datePicker.nextMonth}
          nextMonthButtonLabel={translation.datePicker.nextMonth}
          monthAriaLabelPrefix={translation.datePicker.month}
          chooseDayAriaLabelPrefix={translation.datePicker.chooseDay}
          disabledDayAriaLabelPrefix={translation.datePicker.unavailableDay}
          className="border-2 border-gray-400 px-3 py-2 w-full text-sm"
          disabled={!canEdit || loadingProject}
          isClearable
          clearButtonTitle={translation.datePicker.clearDate}
          ariaLabelClose={translation.datePicker.clearDate}
        />
      </div>

      <div className="mt-2">
        <label
          htmlFor="report-contact-details"
          className="text-left font-medium"
        >
          {translation.reportContactDetails}
        </label>
        <textarea
          id="report-contact-details"
          value={project?.reportContactDetails ?? ""}
          onChange={(event) =>
            updateField("reportContactDetails", event.target.value)
          }
          className="border-2 border-gray-400 px-3 py-2 w-full text-sm"
          rows={3}
          maxLength={2000}
          disabled={!canEdit || loadingProject}
        />
      </div>

      <div className="mt-2">
        <label
          htmlFor="report-calculation-notes"
          className="text-left font-medium"
        >
          {translation.reportNotes}
        </label>
        <textarea
          id="report-calculation-notes"
          value={project?.reportNotes ?? ""}
          onChange={(event) => updateField("reportNotes", event.target.value)}
          className="border-2 border-gray-400 px-3 py-2 w-full text-sm"
          rows={5}
          maxLength={5000}
          disabled={!canEdit || loadingProject}
        />
      </div>
    </>
  );
}
