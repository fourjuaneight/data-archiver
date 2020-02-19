const dateFmt = date => {
  let original = null;
  const now = new Date();
  const oneDayAgo = now.setDate(now.getDate() - 1);
  const tenMinutesAgo = now.setMinutes(now.getMinutes() - 10);
  const offset = now.getTimezoneOffset() * 60000;
  const yesterday = new Date(oneDayAgo - offset).toISOString().slice(0, -5);
  const tenBehind = new Date(tenMinutesAgo - offset).toISOString().slice(0, -5);

  if (date) {
    const originalDate = new Date(date);
    original = new Date(originalDate - offset).toISOString().slice(0, -5);
  }

  return {
    original,
    tenBehind,
    yesterday,
  };
};

exports.dateFmt = dateFmt;
