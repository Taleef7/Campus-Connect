// jest.config.js

export default {
    testEnvironment: "jsdom",
    transform: {
      "^.+\\.(js|jsx)$": "babel-jest",
    },
    moduleFileExtensions: ["js", "jsx"],
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"], // ✅ add this line
  };
  