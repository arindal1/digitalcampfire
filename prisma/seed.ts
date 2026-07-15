import prisma from "../lib/prisma";

const prompts = [
  "What made you smile today?",
  "If you could master one skill instantly, what would it be?",
  "What is a place everyone should visit once?",
  "What hobby surprised you the most?",
  "What movie would you erase from your memory just to watch again?",
  "What is something small that brings you joy?",
  "If you could have dinner with anyone, dead or alive, who would it be?",
  "What is a belief you hold that most people would disagree with?",
  "What would you do with an extra hour every day?",
  "What is the best piece of advice you have ever received?",
  "What is something you're looking forward to this month?",
  "What is the most interesting thing you've learned recently?",
  "If money wasn't a factor, what would you spend your time doing?",
  "What is the best trip you've ever taken?",
  "What is a food you could eat every day and never get tired of?",
  "What is something most people don't know about you?",
  "What was your dream job when you were a kid?",
  "What is a random skill you're surprisingly good at?",
  "If you could relive one day from your life, which would it be?",
  "What is your favorite way to spend a weekend?",
  "What is the most beautiful place you've ever seen?",
  "What is a small luxury you enjoy regularly?",
  "What app do you use more than any other?",
  "What is the best purchase you've made under $50?",
  "What is a trend you actually like?",
  "What is a trend you never understood?",
  "What is your go-to comfort food?",
  "What is one thing on your bucket list?",
  "What would your perfect vacation look like?",
  "What is a hobby you'd love to get into someday?",
  "What is the funniest thing that happened to you recently?",
  "What is your favorite family tradition?",
  "What is a book that changed your perspective?",
  "What is your favorite way to meet new people?",
  "What is something that always makes you laugh?",
  "If you could instantly become an expert in something, what would it be?",
  "What is a place you'd love to live for a year?",
  "What is the best compliment you've ever received?",
  "What is a lesson you learned the hard way?",
  "What is your favorite season and why?",
  "What is something you've always wanted to ask people?",
  "What fictional world would you want to visit?",
  "What is your favorite thing about where you live?",
  "What is one thing you think everyone should try once?",
  "If you could have any superpower, what would it be?",
  "What is your most memorable birthday?",
  "What is a skill that took you a long time to learn?",
  "What is your favorite local restaurant or cafe?",
  "What motivates you when you're feeling stuck?",
  "What is a goal you're currently working toward?",
  "What is a simple thing that improves your day?",
  "What is your favorite childhood memory?",
  "What song never gets old for you?",
  "What is your ideal way to spend a rainy day?",
  "What is something you're proud of accomplishing?",
  "What is a movie everyone seems to love but you don't?",
  "What is the kindest thing someone has done for you?",
  "What is your favorite conversation topic?",
  "What is one thing you'd teach everyone if you could?",
  "What is a hidden gem people should know about?",
  "What's been the highlight of your week so far?",
  "How do you usually like to spend your free time?",
  "Have you discovered anything interesting lately?",
  "What's your favorite place you've traveled to?",
  "What are you currently excited about?",
  "If you had a free flight tomorrow, where would you go?",
  "What's a hobby you've always wanted to try?",
  "What's the best recommendation someone gave you recently?",
  "Are you more of a morning person or a night owl?",
  "What's something you're passionate about that you could talk about for hours?",
  "What experience shaped who you are today?",
  "What value is most important to you?",
  "What is something you're still trying to figure out?",
  "What makes you feel most alive?",
  "When do you feel happiest?",
  "What is a challenge that taught you an important lesson?",
  "Who has influenced your life the most?",
  "What kind of impact would you like to have on others?",
  "What is something you'd like to improve about yourself?",
  "What are you most grateful for right now?",
];


async function main() {
  await prisma.prompt.createMany({
    data: prompts.map((content) => ({ content })),
    skipDuplicates: true,
  });
  console.log(`Seeded ${prompts.length} prompts.`);

  // Set a specific user as verified (admin bootstrap).
  // Pass the account email via the ADMIN_EMAIL environment variable:
  //   ADMIN_EMAIL=you@example.com npx prisma db seed
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const updated = await prisma.user.updateMany({
      where: { email: adminEmail },
      data: { verified: true },
    });
    if (updated.count > 0) {
      console.log(`Set verified=true for ${adminEmail}`);
    } else {
      console.warn(`No user found with email ${adminEmail} — create your account first, then re-run the seed.`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());