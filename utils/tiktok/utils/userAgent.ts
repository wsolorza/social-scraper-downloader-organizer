// eslint-disable-next-line import/prefer-default-export
export const getRandom = () => {
  const os = [
    "Macintosh; Intel Mac OS X 10_15_7",
    "Macintosh; Intel Mac OS X 10_15_5",
    "Macintosh; Intel Mac OS X 10_11_6",
    "Macintosh; Intel Mac OS X 10_6_6",
    "Macintosh; Intel Mac OS X 10_9_5",
    "Macintosh; Intel Mac OS X 10_10_5",
    "Macintosh; Intel Mac OS X 10_7_5",
    "Macintosh; Intel Mac OS X 10_11_3",
    "Macintosh; Intel Mac OS X 10_10_3",
    "Macintosh; Intel Mac OS X 10_6_8",
    "Macintosh; Intel Mac OS X 10_10_2",
    "Macintosh; Intel Mac OS X 10_10_3",
    "Macintosh; Intel Mac OS X 10_11_5",
    "Windows NT 10.0; Win64; x64",
    "Windows NT 10.0; WOW64",
    "Windows NT 10.0",
  ];

  return `Mozilla/5.0 (${
    os[Math.floor(Math.random() * os.length)]
  }) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${
    Math.floor(Math.random() * 3) + 85
  }.0.${Math.floor(Math.random() * 190) + 4100}.${
    Math.floor(Math.random() * 50) + 140
  } Safari/537.36`;
};
