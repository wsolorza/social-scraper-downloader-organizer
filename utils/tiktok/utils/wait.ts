const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export default wait;
