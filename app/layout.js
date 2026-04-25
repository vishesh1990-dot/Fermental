export const metadata = {
  title: "Fermental — Culture · Craft · Curiosity",
  description: "A space for fermentation, recipes, learning, and like-minded people.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}