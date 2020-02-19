const dateFmt = date => {
  const now = new Date();
  const oneDayAgo = now.setDate(now.getDate() - 1);
  const tenMinutesAgo = now.setMinutes(now.getMinutes() - 10);
  const originalDate = new Date(date);
  const offset = now.getTimezoneOffset() * 60000;
  const yesterday = new Date(oneDayAgo - offset).toISOString().slice(0, -5);
  const tenBehind = new Date(tenMinutesAgo - offset).toISOString().slice(0, -5);
  const original = new Date(originalDate - offset).toISOString().slice(0, -5);

  return {
    original,
    tenBehind,
    yesterday,
  };
};

exports.dateFmt = dateFmt;
