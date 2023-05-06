const classNames = (...strings: unknown[]) => {
  const className = {
    value: "",
  };
  strings.forEach((classes) => {
    if (classes === null || classes === undefined) {
      return;
    } else if (typeof classes === "string") {
      className.value += ` ${classes}`;
    } else if (typeof classes === "object" && !Array.isArray(classes)) {
      Object.keys(classes).forEach((key) => {
        const value: unknown = classes[key as keyof typeof classes];
        if (!!value === true) {
          className.value += ` ${key}`;
        }
      });
    }
  });
  return className.value.trim() ?? "";
};
export default classNames;
