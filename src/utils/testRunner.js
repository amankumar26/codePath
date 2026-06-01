/**
 * Runs a list of assertions against the user's code.
 * Uses DOMParser to create a virtual document and evaluates each test.
 * 
 * @param {string} userCode The code written by the user.
 * @param {Array} tests The array of tests from the course JSON.
 * @returns {Array} List of test results { description, passed, error }
 */
export const runTests = (userCode, tests) => {
  if (!tests || !Array.isArray(tests)) return [];

  // Parse HTML code using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(userCode, 'text/html');

  return tests.map((test) => {
    try {
      // Create a function that accepts `doc` and `code` as parameters and returns boolean
      // We wrap the test code to guarantee that it returns a boolean
      const assertionFn = new Function('doc', 'code', test.assertion);
      const result = assertionFn(doc, userCode);

      return {
        description: test.description,
        passed: Boolean(result),
        error: null
      };
    } catch (error) {
      console.error('Error running test assertion:', error);
      return {
        description: test.description,
        passed: false,
        error: error.message || 'Error executing test assertion'
      };
    }
  });
};
