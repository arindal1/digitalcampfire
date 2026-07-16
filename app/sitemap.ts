import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://digitalcampfire-production.up.railway.app",
      priority: 1,
      changeFrequency: "weekly",
    },
    {
      url: "https://digitalcampfire-production.up.railway.app/login",
    },
    {
      url: "https://digitalcampfire-production.up.railway.app/register",
    },
  ];
}