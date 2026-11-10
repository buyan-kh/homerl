# homeRL

A local question-and-answer drill. Cards you miss come back more often until you mark them "Got it" enough times for the pattern to stick.

The first deck is CS 166 Test 2 (Chapters 6 to 9), built from Mark Stamp's current review.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000

Your memory stays in this browser (localStorage). Use Reset memory to start the deck over.

Grade yourself honestly: Missed it, Close, or Got it. A card is treated as learned after three "Got it" ratings in a row, and then it only shows up as light review.
