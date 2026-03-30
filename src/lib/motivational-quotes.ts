export interface Quote {
  text: string;
  author: string;
}

export const motivationalQuotes: Quote[] = [
  {
    text: "The goal is to turn data into information, and information into insight.",
    author: "Carly Fiorina",
  },
  {
    text: "Without data, you're just another person with an opinion.",
    author: "W. Edwards Deming",
  },
  {
    text: "Data is the new oil. It's valuable, but if unrefined it cannot really be used.",
    author: "Clive Humby",
  },
  {
    text: "In God we trust. All others must bring data.",
    author: "W. Edwards Deming",
  },
  {
    text: "Information is the oil of the 21st century, and analytics is the combustion engine.",
    author: "Peter Sondergaard",
  },
  {
    text: "Data is a precious thing and will last longer than the systems themselves.",
    author: "Tim Berners-Lee",
  },
  {
    text: "Errors using inadequate data are much less than those using no data at all.",
    author: "Charles Babbage",
  },
  {
    text: "The world is one big data problem.",
    author: "Andrew McAfee",
  },
  {
    text: "Data beats emotions.",
    author: "Sean Rad",
  },
  {
    text: "If you can't measure it, you can't improve it.",
    author: "Peter Drucker",
  },
  {
    text: "Data-driven decisions are the key to success in today's business world.",
    author: "John Sculley",
  },
  {
    text: "What gets measured gets managed.",
    author: "Peter Drucker",
  },
  {
    text: "The best thing about being a statistic is that you can say 'I'm 100% sure about that.'",
    author: "Unknown",
  },
  {
    text: "Big data is at the foundation of all of the megatrends that are happening.",
    author: "John Sculley",
  },
  {
    text: "Hiding within those mounds of data is knowledge that could change the life of a patient, or change the world.",
    author: "Atul Butte",
  },
  {
    text: "You can have data without information, but you cannot have information without data.",
    author: "Daniel Keys Moran",
  },
  {
    text: "The more you learn, the more you earn.",
    author: "Warren Buffett",
  },
  {
    text: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci",
  },
  {
    text: "The beautiful thing about learning is that nobody can take it away from you.",
    author: "B.B. King",
  },
  {
    text: "Education is not the filling of a pail, but the lighting of a fire.",
    author: "W.B. Yeats",
  },
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
  },
  {
    text: "Every expert was once a beginner. Keep going.",
    author: "Unknown",
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Analytics at its best is like a pair of X-ray glasses.",
    author: "Avinash Kaushik",
  },
  {
    text: "Torture the data, and it will confess to anything.",
    author: "Ronald Coase",
  },
  {
    text: "Statistical thinking will one day be as necessary for efficient citizenship as the ability to read and write.",
    author: "H.G. Wells",
  },
  {
    text: "Not everything that can be counted counts, and not everything that counts can be counted.",
    author: "Albert Einstein",
  },
  {
    text: "Prediction is very difficult, especially if it's about the future.",
    author: "Niels Bohr",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Every accomplishment starts with the decision to try.",
    author: "John F. Kennedy",
  },
  {
    text: "Quality is more important than quantity. One home run is much better than two doubles.",
    author: "Steve Jobs",
  },
  {
    text: "Numbers have an important story to tell. They rely on you to give them a voice.",
    author: "Stephen Few",
  },
  {
    text: "Data are just summaries of thousands of stories — tell a few of those stories to help make the data meaningful.",
    author: "Chip & Dan Heath",
  },
];

export const getRandomQuote = (): Quote => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
};
