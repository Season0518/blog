import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://season.ac/",
    title: "Season's Blog",
    description: "记录算法、编程与学习中的探索。",
    author: "Season",
    icpNumber: "吉ICP备2025034019号",
    googleAnalyticsIds: {
      cn: "G-GVFE3FCTJS",
      worldwide: "G-4R1BNLBKV2",
    },
    profile: "https://github.com/Season0518",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/Season0518", linkTitle: "Season 的 GitHub" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
