const CreateCurrentDate = (): string => {
  // Creates a current date in the format "2022-02-22 22:22:22".
  const now = new Date();
  const currentDate = new Intl.DateTimeFormat("sv-SV", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  return currentDate.replace(" ", "T");
};

export default CreateCurrentDate;