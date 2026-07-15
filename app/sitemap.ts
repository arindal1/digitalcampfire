import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://digitalcampfire.app",
      priority: 1,
      changeFrequency: "weekly",
    },
    {
      url: "https://digitalcampfire.app/login",
    },
    {
      url: "https://digitalcampfire.app/register",
    },
  ];
}