module.exports = function () {
  return {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: "http://fake-url.com" }),
      },
    },
    webhook: {
      constructEvent: jest.fn(),
    },
  };
};
