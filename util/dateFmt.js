const dateFmt = date => {
  const currDate = new Date();
  const yesterday = currDate.setDate(currDate.getDate() - 1);
  const orgDate = new Date(date);
  const offset = currDate.getTimezoneOffset() * 60000;
  const compare = new Date(yesterday - offset).toISOString().slice(0, -5);
  const original = new Date(orgDate - offset).toISOString().slice(0, -5);

  return {
    compare,
    original,
  };
};

exports.dateFmt = dateFmt;
