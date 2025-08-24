module.exports = {
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  collectCoverage: true,
  coverageReporters: ["lcov", "text"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"]
};
