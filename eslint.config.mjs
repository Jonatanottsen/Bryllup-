import next from "eslint-config-next";

const config = [
  ...next,
  { ignores: [".next/**", "drizzle/**"] },
  {
    // CSV-eksportene er filnedlastinger, ikke sider – vanlig <a> er riktig der.
    files: ["src/app/admin/**/*.tsx"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
];
export default config;
