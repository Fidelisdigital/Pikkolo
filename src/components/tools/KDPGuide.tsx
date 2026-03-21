import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Book, Ruler, DollarSign, Rocket, Info } from 'lucide-react';

const kdpContent = `
# KDP Publishing Master Guide

Publishing your book on Amazon Kindle Direct Publishing (KDP) requires attention to detail. Here's everything you need to know to get started.

## 1. Trim Sizes & Margins
Choosing the right size is crucial for your book's look and feel.

| Book Type | Common Trim Size |
| :--- | :--- |
| **Children's Books** | 8.5" x 8.5" or 8" x 10" |
| **Coloring Books** | 8.5" x 11" |
| **Novels/Fiction** | 5" x 8" or 6" x 9" |
| **Workbooks** | 8.5" x 11" |

### Margins (With Bleed)
If your images go to the edge of the page, you must select **"Bleed"** in KDP.
- **Inside Margin:** 0.375" (for books up to 150 pages)
- **Outside Margins:** 0.25" minimum

## 2. Royalties & Pricing
Amazon takes a cut, but you keep the lion's share.

- **eBooks:** 35% or 70% (depending on price point)
- **Paperbacks:** 60% of the list price, minus printing costs.

**Printing Cost Formula:**
\`Fixed Cost + (Page Count * Per Page Cost) = Printing Cost\`

## 3. The Publishing Workflow
1. **Format your interior:** Use PDF for paperbacks.
2. **Design your cover:** Use the BookBloom Cover Tool!
3. **Keywords & Categories:** Choose 7 keywords and 3 categories that best describe your book.
4. **Upload:** Head to [kdp.amazon.com](https://kdp.amazon.com) and follow the prompts.
5. **Review:** Use the KDP Print Previewer to check for errors.

## 4. Pro Tips for Success
- **Niche Down:** Don't just make a "Coloring Book". Make a "Steampunk Owl Coloring Book for Seniors".
- **A+ Content:** Use the marketing tools on KDP to show "inside the book" images on your sales page.
- **Series:** Books in a series sell better than standalone titles.
`;

const KDPGuide: React.FC = () => {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif italic font-bold text-foreground">KDP Master Guide</h2>
        <p className="text-muted-foreground">Trim sizes, margins, royalties, and the full publishing workflow.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-card p-10 rounded-[40px] border border-border shadow-xl">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-headings:italic prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-10 prose-table:border prose-table:rounded-xl overflow-hidden text-foreground">
            <ReactMarkdown>{kdpContent}</ReactMarkdown>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-lg shadow-primary/20">
            <Rocket size={32} className="mb-4" />
            <h3 className="text-xl font-bold mb-2">Ready to Launch?</h3>
            <p className="text-primary-foreground/80 text-sm mb-6">Once your content is ready, head over to Amazon KDP to start your journey.</p>
            <a 
              href="https://kdp.amazon.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-center py-3 bg-background text-primary rounded-xl font-bold hover:bg-background/90 transition-all"
            >
              Visit KDP
            </a>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: 'Cover Calculator', icon: Ruler },
                { label: 'Royalty Calculator', icon: DollarSign },
                { label: 'KDP University', icon: Info },
              ].map((link, i) => (
                <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all text-sm font-medium text-foreground">
                  <link.icon size={16} className="text-primary" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KDPGuide;
