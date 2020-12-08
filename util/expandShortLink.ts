/**
 * Expand shortend URLs.
 * @function
 *
 * @param {string} url shortned url string
 * @returns {Promise<string>} expanded URL
 */
const expandLinks = async (url: string): Promise<string> => {
  try {
    const response: Response = await fetch(url);

    if (!response.ok) {
      console.error("Expand Links:", {
        code: response.status,
        type: response.type,
        text: response.statusText,
      });
      Deno.exit(1);
    }

    return response.url;
  } catch (error) {
    console.error("Expand Links:", error);
    Deno.exit(1);
  }
};

/**
 * Get expanded URLs.
 * @function
 *
 * @param {string} str string to replace
 * @param {RegExp} regex pattern to match
 * @returns {Promise<string>} list of expanded URLs from str
 */
const expandShortLink = async (str: string, regex: RegExp): Promise<string> => {
  const promises: Promise<string>[] = [];
  const pattern: RegExp = new RegExp(regex);

  str.replace(pattern, (match, ...args) => {
    const promise = expandLinks(match);
    promises.push(promise);

    return match;
  });

  const data: string[] = await Promise.all(promises);
  const replacer = () => data.shift() ?? "";

  return str.replace(regex, replacer);
};

export default expandShortLink;
