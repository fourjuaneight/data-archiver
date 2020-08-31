import ky from "https://unpkg.com/ky/index.js";

/**
 * Expand shortend URLs.
 * @function
 *
 * @param {string} url shortned url string
 * @returns {Promise<Response>} expanded URL
 */
const expandLinks = async (url: string): Promise<string> => {
  const link: Promise<string> = await ky
    .get(url)
    .then((response: Response) => response.url)
    .catch((err: string) => console.error(err));

  return link;
};

/**
 * Get expanded URLs.
 * @function
 *
 * @param {string} str string to replace
 * @param {RegExp} regex pattern to match
 * @returns {Promise<string>} list of expanded URLs from str
 */
const expandShortLink = async (
  str: string,
  regex: RegExp
): Promise<string> => {
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
